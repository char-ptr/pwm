pub mod account;
use axum::{routing::get, Router};
use sqlx::PgPool;

use self::account::ACCOUNT_ROUTER;

pub async fn test_route() -> &'static str {
    "server works"
}

pub fn construct_router(db: PgPool) -> Router {
    Router::new()
        // the Router is composed of an Arc with inner state. this clone should be relatively
        // cheap.
        .nest("/account", ACCOUNT_ROUTER.clone())
        .route("/test", get(test_route))
        .with_state(db)
}
