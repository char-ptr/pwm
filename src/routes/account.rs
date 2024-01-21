use std::{fmt::Debug, ops::Deref, str::FromStr, sync::LazyLock};

use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    Json, RequestPartsExt, Router,
};
use chrono::Duration;
use scrypt::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Scrypt,
};
use serde::Deserialize;
use serde_json::Value;
use sqlx::Connection;
use uuid::Uuid;

use crate::{
    db::{
        user::{AccessToken, User},
        vault::Vault,
    },
    errors::DATABASE_CONN_ERR,
    PwmResponse, PwmState,
};

#[derive(Deserialize, Debug)]
pub struct LoginData {
    username: String,
    password: String,
}
#[derive(Deserialize, Debug)]
pub struct RegisterData {
    username: String,
    password: String,
    first_name: Option<String>,
    content_key: String,
}
#[derive(Deserialize, Debug)]
pub struct LoggedInData(AccessToken);

impl Deref for LoggedInData {
    type Target = AccessToken;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
#[async_trait]
impl<S> FromRequestParts<S> for LoggedInData
where
    PwmState: FromRef<S>,
    S: Send + Sync + Debug,
{
    type Rejection = (StatusCode, Json<PwmResponse>);

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        // unwrapping because infallible

        let State(db): State<PwmState> = parts.extract_with_state(state).await.unwrap();
        let Some(access) = parts
            .extract::<HeaderMap>()
            .await
            .unwrap()
            .get("access_token")
            .cloned()
        else {
            return Err((
                StatusCode::UNAUTHORIZED,
                PwmResponse::failure("access token was not provided", Some("try logging in"))
                    .into(),
            ));
        };

        // check that the access token hasn't expired

        let access_messed_up = PwmResponse::failure("nice fucked up access token btw", None);
        let access_messed_err = (StatusCode::UNAUTHORIZED, Json(access_messed_up));

        let access_token_str = access.to_str().or(Err(access_messed_err.clone()))?;
        let access_token_uuid =
            Uuid::from_str(access_token_str).or(Err(access_messed_err.clone()))?;
        let mut db_conn = db.acquire().await.or(Err(access_messed_err.clone()))?;
        AccessToken::lookup(&access_token_uuid, &mut db_conn)
            .await
            .or(Err(access_messed_err))
            .and_then(|x| {
                x.ok_or((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(PwmResponse::failure("invalid access token", None)),
                ))
            })
            .map(LoggedInData)
    }
}

pub async fn user_data(
    State(db): State<PwmState>,
    access: LoggedInData,
) -> Result<Json<PwmResponse<Value>>, (StatusCode, Json<PwmResponse>)> {
    let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;
    access
        .get_user(&mut db_conn)
        .await
        .or(Err(DATABASE_CONN_ERR))
        .map(|x| {
            // remove password field from response
            let mut val = serde_json::to_value(x).unwrap();
            *val.get_mut("password").unwrap() = Value::Null;
            Json(PwmResponse::success(val))
        })
}

pub async fn login(
    State(db): State<PwmState>,
    Json(log_data): Json<LoginData>,
) -> Result<Json<PwmResponse<AccessToken>>, (StatusCode, Json<PwmResponse>)> {
    let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;
    let Ok(Some(existing_user)) =
        User::lookup_username(log_data.username.as_str(), &mut db_conn).await
    else {
        // unable to find user or db failure lol
        return Err((
            StatusCode::BAD_REQUEST,
            Json(PwmResponse::failure(
                "unable to find user with that username and password",
                Some("Try a different combination"),
            )),
        ));
    };
    if existing_user.check_password(&log_data.password).is_ok() {
        // grant access

        let token = existing_user.create_access_token(Duration::minutes(30));
        token
            .commit_to_db(&mut db_conn)
            .await
            .or(Err(DATABASE_CONN_ERR))?;
        return Ok(Json(PwmResponse::success(token)));
    }
    Err((
        StatusCode::BAD_REQUEST,
        Json(PwmResponse::failure(
            "unable to find user with that username and password",
            Some("Try a different combination"),
        )),
    ))
}
pub async fn register(
    State(db): State<PwmState>,
    Json(reg_data): Json<RegisterData>,
) -> Result<Json<PwmResponse<AccessToken>>, (StatusCode, Json<PwmResponse>)> {
    let mut db_conn = db.acquire().await.or(Err(DATABASE_CONN_ERR))?;

    // does the user already exist with that username? let's find out!
    if let Ok(Some(_)) = User::lookup_username(reg_data.username.as_str(), &mut db_conn).await {
        // i guess they do
        return Err((
            StatusCode::BAD_REQUEST,
            Json(PwmResponse::failure(
                "username is already occupied",
                Some("Choose a different username"),
            )),
        ));
    }

    let salt = SaltString::generate(&mut OsRng);
    let password = Scrypt
        .hash_password(reg_data.password.as_bytes(), &salt)
        .or(Err((
            StatusCode::BAD_REQUEST,
            Json(PwmResponse::failure(
                "poorly formed password",
                Some("choose a different password"),
            )),
        )))?
        .to_string();

    let new_user = User::new(
        reg_data.username,
        password,
        reg_data.content_key,
        reg_data.first_name,
    );

    db_conn
        .transaction(|tx| {
            Box::pin(async move {
                new_user.commit_to_db(tx).await?;
                let vault = Vault::new(&new_user);
                let token = new_user.create_access_token(Duration::minutes(30));
                token.commit_to_db(tx).await?;
                vault.commit_to_db(tx).await?;
                Ok::<Json<PwmResponse<AccessToken>>, sqlx::Error>(Json(PwmResponse::success(token)))
            })
        })
        .await
        .or(Err(DATABASE_CONN_ERR))
}

pub(crate) static ACCOUNT_ROUTER: LazyLock<Router<PwmState>> = LazyLock::new(|| {
    Router::new()
        .route("/me", get(user_data))
        .route("/login", post(login))
        .route("/register", post(register))
});
