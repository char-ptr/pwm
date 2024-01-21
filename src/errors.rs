use axum::{http::StatusCode, Json};

use crate::PwmResponse;

pub const DATABASE_CONN_ERR: (StatusCode, Json<PwmResponse>) = (
    StatusCode::INTERNAL_SERVER_ERROR,
    Json(PwmResponse::failure("Unable to connect to database", None)),
);
