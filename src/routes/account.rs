use axum::{extract::State, Json};
use serde::Deserialize;
use sqlx::PgPool;

use crate::db::user::User;

#[derive(Deserialize, Debug)]
pub struct RegisterData {
    username: String,
    password: String,
    first_name: Option<String>,
    content_key: String,
}

pub async fn register(State(db): State<PgPool>, Json(reg_data): Json<RegisterData>) {
    let new_user = User::new(
        reg_data.username,
        reg_data.password,
        reg_data.content_key,
        reg_data.first_name,
    );
}
