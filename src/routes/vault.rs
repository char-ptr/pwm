use std::sync::LazyLock;

use axum::Router;

use crate::PwmState;

// pub async fn list_root_items(
//     State(db): State<PwmState>,
//     access: LoggedInData,
// ) -> Result<Json<PwmResponse<Vec<VaultItem>>>, (StatusCode, Json<PwmResponse>)> {
//     let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;
//     VaultFolder::fetch_items(&mut db_conn, vault_id, folder_id)
// }

pub(crate) static VAULT_ROUTER: LazyLock<Router<PwmState>> = LazyLock::new(|| Router::new());
