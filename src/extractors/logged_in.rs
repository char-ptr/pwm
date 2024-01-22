use std::{ops::Deref, str::FromStr};

use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts, State},
    http::{HeaderMap, StatusCode},
    Json, RequestPartsExt,
};
use sea_orm::{DbConn, DbErr, EntityTrait};
use uuid::Uuid;

use crate::{
    db::entities::{access_token, user},
    PwmResponse, PwmState,
};

#[derive(Debug)]
pub struct LoggedInData {
    access_token: access_token::Model,
    user: user::Model,
}
impl LoggedInData {
    pub async fn from_token_id(token: &Uuid, db: &DbConn) -> Result<Option<Self>, DbErr> {
        tracing::debug!("constructing logged in data from token[{}]", token);
        access_token::Entity::find_by_id(*token)
            .find_also_related(user::Entity)
            .one(db)
            .await
            .map(|x| {
                x.and_then(|y| {
                    Some(Self {
                        access_token: y.0,
                        user: y.1?,
                    })
                })
            })
    }
    pub fn into_user(self) -> user::Model {
        self.user
    }
    pub fn user(&self) -> &user::Model {
        &self.user
    }
    pub fn access_token(&self) -> &access_token::Model {
        &self.access_token
    }
}
impl From<LoggedInData> for access_token::Model {
    fn from(value: LoggedInData) -> Self {
        value.access_token
    }
}
impl From<LoggedInData> for user::Model {
    fn from(value: LoggedInData) -> Self {
        value.user
    }
}
impl Deref for LoggedInData {
    type Target = access_token::Model;
    fn deref(&self) -> &Self::Target {
        &self.access_token
    }
}

#[async_trait]
impl<S> FromRequestParts<S> for LoggedInData
where
    PwmState: FromRef<S>,
    S: Send + Sync + core::fmt::Debug,
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
        LoggedInData::from_token_id(&access_token_uuid, db.deref())
            .await
            .transpose()
            .ok_or(access_messed_err.clone())?
            .or(Err(access_messed_err))
    }
}
