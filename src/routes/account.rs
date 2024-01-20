use axum::{extract::State, Json};
use serde::Deserialize;
use sqlx::{Connection, PgPool};

use crate::db::{user::User, vault::Vault};

#[derive(Deserialize, Debug)]
pub struct RegisterData {
    username: String,
    password: String,
    first_name: Option<String>,
    content_key: String,
}

pub async fn register(
    State(db): State<PgPool>,
    Json(reg_data): Json<RegisterData>,
) -> Result<(), String> {
    let new_user = User::new(
        reg_data.username,
        reg_data.password,
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
