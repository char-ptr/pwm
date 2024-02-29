pub mod account;
pub mod vault;
use axum::{
    http::{HeaderName, Method},
    routing::get,
    Router,
};
use axum_client_ip::SecureClientIpSource;
use axum_extra::headers::{ContentType, Header};
use sea_orm::DbConn;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};

use self::{account::ACCOUNT_ROUTER, vault::VAULT_ROUTER};

pub async fn test_route() -> &'static str {
    "server works"
}

pub fn construct_router(db: DbConn, SecureipSource: SecureClientIpSource) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_headers([
            ContentType::name().to_owned(),
            HeaderName::from_static("access_token"),
        ])
        .allow_methods([Method::GET, Method::POST]);
    Router::new()
        // the Router is composed of an Arc with inner state. this clone should be relatively
        // cheap.
        .nest("/account", ACCOUNT_ROUTER.clone())
        .nest("/vault", VAULT_ROUTER.clone())
        .route("/test", get(test_route))
        .layer(cors)
        .layer(SecureipSource.into_extension())
        .layer(TraceLayer::new_for_http())
        .with_state(crate::PwmState(db))
}
