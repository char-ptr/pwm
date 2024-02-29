use std::{fmt::Debug, ops::Deref, str::FromStr, sync::LazyLock};

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::Duration;
use scrypt::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Scrypt,
};
use sea_orm::{ActiveModelTrait, DbErr, IntoActiveModel, Set, TransactionTrait, TryIntoModel};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
    db::{
        entities::{
            access_token,
            prelude::{User, Vault},
            user,
        },
        models::user_ex::{InsensitiveUser, UserTokens},
    },
    errors::{DATABASE_CONN_ERR, DB_ERR},
    extractors::{identifiable_device::IdentifiableDevice, logged_in::LoggedInData},
    PwmResponse, PwmState,
};

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
    content_iv: Vec<u8>,
    password_salt: Vec<u8>,
    content_key: String,
}

pub async fn user_tokens(
    State(_): State<PwmState>,
    access: LoggedInData,
) -> Json<PwmResponse<UserTokens>> {
    // let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;
    Json(PwmResponse::success(access.into_user().into()))
}
pub async fn user_data(
    State(_): State<PwmState>,
    access: LoggedInData,
) -> Json<PwmResponse<InsensitiveUser>> {
    // let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;
    Json(PwmResponse::success(access.into_user().into()))
}
pub async fn login(
    State(db): State<PwmState>,
    device: IdentifiableDevice,
    Json(log_data): Json<LoginData>,
) -> Result<Json<PwmResponse<access_token::Model>>, (StatusCode, Json<PwmResponse>)> {
    use crate::db::entities::prelude::*;
    let Ok(Some(existing_user)) =
        User::lookup_username(log_data.username.as_str(), db.deref()).await
    else {
        // unable to find user or db failure lol
        return Err((
            StatusCode::BAD_REQUEST,
            Json(PwmResponse::failure(
                "unable to find user with that username and password",
                Some("Try a different combination"),
            )),
        ));
    };
    if existing_user.check_password(&log_data.password).is_ok() {
        // grant access

        let token = existing_user.make_access_token(Duration::minutes(30), &device);
        let tam = token.into_active_model();
        let token = tam.insert(db.deref()).await.or(Err(DB_ERR))?;
        return Ok(Json(PwmResponse::success(token)));
    }
    Err((
        StatusCode::BAD_REQUEST,
        Json(PwmResponse::failure(
            "unable to find user with that username and password",
            Some("Try a different combination"),
        )),
    ))
}
pub async fn register(
    State(db): State<PwmState>,
    device: IdentifiableDevice,
    Json(reg_data): Json<RegisterData>,
) -> Result<Json<PwmResponse<access_token::Model>>, (StatusCode, Json<PwmResponse>)> {
    // does the user already exist with that username? let's find out!
    if let Ok(Some(_)) = User::lookup_username(reg_data.username.as_str(), db.deref()).await {
        // i guess they do
        return Err((
            StatusCode::BAD_REQUEST,
            Json(PwmResponse::failure(
                "username is already occupied",
                Some("Choose a different username"),
            )),
        ));
    }

    let salt = SaltString::generate(&mut OsRng);
    let password = Scrypt
        .hash_password(reg_data.password.as_bytes(), &salt)
        .or(Err((
            StatusCode::BAD_REQUEST,
            Json(PwmResponse::failure(
                "poorly formed password",
                Some("choose a different password"),
            )),
        )))?
        .to_string();

    let new_user = user::ActiveModel {
        user_id: Set(Uuid::new_v4()),
        username: Set(reg_data.username),
        content_iv: Set(Some(reg_data.content_iv)),
        password_salt: Set(Some(reg_data.password_salt)),
        alias: Set(reg_data
            .first_name
            .unwrap_or_else(|| "Anonymous".to_string())),

        content_key: Set(reg_data.content_key),
        user_created_at: Set(chrono::Utc::now().fixed_offset()),
        password: Set(password),
    };

    let ret = db
        .transaction(|tx| {
            Box::pin(async move {
                let user_model = new_user.insert(tx).await?;
                let vault = Vault::make_from_user(&user_model);
                let token = user_model.make_access_token(Duration::minutes(30), &device);
                let _ = vault.insert(tx).await?;
                let token = token.into_active_model().insert(tx).await?;
                Ok::<Json<PwmResponse<access_token::Model>>, DbErr>(Json(PwmResponse::success(
                    token,
                )))
            })
        })
        .await
        .map_err(|x| {
            tracing::error!("error creating user: {}", x);
            DB_ERR
        })?;

    Ok(ret)
}

pub(crate) static ACCOUNT_ROUTER: LazyLock<Router<PwmState>> = LazyLock::new(|| {
    Router::new()
        .route("/me", get(user_data))
        .route("/tokens", get(user_tokens))
        .route("/login", post(login))
        .route("/register", post(register))
});
