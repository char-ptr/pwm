use std::sync::LazyLock;

use axum::{extract::State, routing::post, Json, Router};
use scrypt::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, SaltString},
    Scrypt,
};
use serde::Deserialize;
use sqlx::{Connection, PgPool, Pool, Postgres};

use crate::db::{user::User, vault::Vault};

#[derive(Deserialize, Debug)]
pub struct LoginData {
    username: String,
    password: String,
}
#[derive(Deserialize, Debug)]
pub struct RegisterData {
    username: String,
    password: String,
    first_name: Option<String>,
    content_key: String,
}

pub async fn login(
    State(db): State<PgPool>,
    Json(log_data): Json<LoginData>,
) -> Result<(), String> {
    let mut db_conn = db.acquire().await.map_err(|x| x.to_string())?;
    let Ok(Some(existing_user)) =
        User::lookup_username(log_data.username.as_str(), &mut db_conn).await
    else {
        // unable to find user or db failure lol
        return Err(String::from(
            "unable to find user with that username and password",
        ));
    };
    if existing_user.check_password(&log_data.password).is_ok() {
        // grant access
        return Ok(());
    }
    Err(String::from(
        "unable to find user with that username and password",
    ))
}
pub async fn register(
    State(db): State<PgPool>,
    Json(reg_data): Json<RegisterData>,
) -> Result<(), String> {
    let mut db_conn = db.acquire().await.map_err(|x| x.to_string())?;

    // does the user already exist with that username? let's find out!
    if let Ok(Some(_)) = User::lookup_username(reg_data.username.as_str(), &mut db_conn).await {
        // i guess they do
        return Ok(());
    }

    let salt = SaltString::generate(&mut OsRng);
    let password = Scrypt
        .hash_password(reg_data.password.as_bytes(), &salt)
        .map_err(|x| x.to_string())?
        .to_string();

    let new_user = User::new(
        reg_data.username,
        password,
        reg_data.content_key,
        reg_data.first_name,
    );

    db.acquire()
        .await
        .unwrap()
        .transaction(|tx| {
            Box::pin(async move {
                new_user.commit_to_db(tx).await?;
                let vault = Vault::new(&new_user);
                vault.commit_to_db(tx).await?;
                Ok::<(), sqlx::Error>(())
            })
        })
        .await
        .map_err(|x| x.to_string())
}

pub(crate) static ACCOUNT_ROUTER: LazyLock<Router<Pool<Postgres>>> = LazyLock::new(|| {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register))
});
