pub mod account;
pub mod vault;
use axum::{routing::get, Router};
use axum_client_ip::SecureClientIpSource;
use sea_orm::DbConn;

use self::{account::ACCOUNT_ROUTER, vault::VAULT_ROUTER};

pub async fn test_route() -> &'static str {
    "server works"
}

pub fn construct_router(db: DbConn, SecureipSource: SecureClientIpSource) -> Router {
    Router::new()
        // the Router is composed of an Arc with inner state. this clone should be relatively
        // cheap.
        .nest("/account", ACCOUNT_ROUTER.clone())
        .nest("/vault", VAULT_ROUTER.clone())
        .route("/test", get(test_route))
        .layer(SecureipSource.into_extension())
        .with_state(crate::PwmState(db))
}
