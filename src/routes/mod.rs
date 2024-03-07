pub mod account;
pub mod vault;
use axum::{
    http::{HeaderName, Method},
    routing::get,
    Extension, Router,
};
use axum_client_ip::SecureClientIpSource;
use axum_extra::headers::{ContentType, Header};
use sea_orm::DbConn;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};

use crate::extractors::{
    cacher::ReadyCache,
    logged_in::{LoggedInData, LoggedInResult},
};

use self::{account::ACCOUNT_ROUTER, vault::VAULT_ROUTER};

pub async fn test_route() -> &'static str {
    "server works"
}

pub fn construct_router(db: DbConn, secure_ip_source: SecureClientIpSource) -> Router {
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
        .layer(Extension(ReadyCache::<LoggedInResult>::new(
            std::time::Duration::from_secs(60 * 60),
        )))
        .layer(cors)
        .layer(secure_ip_source.into_extension())
        .layer(TraceLayer::new_for_http())
        .with_state(crate::PwmState(db))
}
