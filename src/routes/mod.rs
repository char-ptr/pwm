use axum::{handler::Handler, routing::get, Router};
use sqlx::PgPool;

pub async fn test_route() -> &'static str {
    "server works"
}

pub fn construct_router(db: PgPool) -> Router {
    let router = Router::new().route("/test", get(test_route)).with_state(db);

    router
}
