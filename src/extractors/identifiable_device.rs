use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts},
    http::StatusCode,
    Json, RequestPartsExt,
};
use axum_client_ip::SecureClientIp;
use axum_extra::{headers::UserAgent, TypedHeader};

use crate::{PwmResponse, PwmState};

pub struct IdentifiableDevice {
    pub(crate) ip: std::net::IpAddr,
    pub(crate) user_agent: String,
}
#[async_trait]
impl<S> FromRequestParts<S> for IdentifiableDevice
where
    PwmState: FromRef<S>,
    S: Send + Sync + core::fmt::Debug,
{
    type Rejection = (StatusCode, Json<PwmResponse>);
    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Ok(SecureClientIp(ip)) = parts.extract().await else {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(PwmResponse::failure("missing connection INFO??!", None)),
            ));
        };
        let Ok(TypedHeader::<UserAgent>(user_agent)) = parts.extract().await else {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(PwmResponse::failure("missing user agent", None)),
            ));
        };
        Ok(IdentifiableDevice {
            ip,
            user_agent: user_agent.to_string(),
        })
    }
}
