use std::sync::LazyLock;

use axum::{extract::State, http::StatusCode, Json, Router};

use crate::{db::vault::VaultItem, errors::DATABASE_CONN_ERR, PwmResponse, PwmState};

use super::account::LoginData;

pub async fn list_root_items(
    State(db): State<PwmState>,
    access: LoginData,
) -> Result<Json<PwmResponse<Vec<VaultItem>>>, (StatusCode, Json<PwmResponse>)> {
    let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;
}

pub(crate) static VAULT_ROUTER: LazyLock<Router<PwmState>> = LazyLock::new(|| Router::new());
