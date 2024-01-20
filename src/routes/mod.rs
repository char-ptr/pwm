pub mod account;
use axum::{
    handler::Handler,
    routing::{get, post},
    Router,
};
use sqlx::PgPool;

use self::account::register;

pub async fn test_route() -> &'static str {
    "server works"
}

pub fn construct_router(db: PgPool) -> Router {
    Router::new()
        .route("/account/register", post(register))
        .route("/test", get(test_route))
        .with_state(db)
}
