use std::{fmt::Display, ops::Deref, pin::Pin, str::FromStr};

use axum::{
    async_trait,
    extract::{FromRef, FromRequestParts, State},
    http::{HeaderMap, StatusCode},
    Extension, Json, RequestPartsExt,
};
use sea_orm::{DbConn, DbErr, EntityTrait};
use std::sync::Arc;
use tokio::sync::broadcast;
use tracing::{debug, error, instrument, Instrument};
use uuid::Uuid;

use crate::{
    db::entities::{access_token, user},
    extractors::cacher::BroadcastType,
    PwmResponse, PwmState,
};

use super::cacher::ReadyCache;

#[derive(Debug, Clone)]
pub struct LoggedInData {
    pub(crate) access_token: access_token::Model,
    pub(crate) user: user::Model,
}
impl Display for LoggedInData {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{{ token: {}, expire_in : {} minutes, user : {}, user_id : {} }}",
            self.access_token.token,
            self.time_until_expiry().num_minutes(),
            self.user.username,
            self.user.user_id
        )
    }
}
impl LoggedInData {
    #[instrument(skip(db))]
    pub async fn from_token_id(token: &Uuid, db: &DbConn) -> Result<Option<Self>, DbErr> {
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
            .inspect(|x| {
                if let Some(data) = x {
                    tracing::debug!("got token data {}", data)
                } else {
                    tracing::warn!("no token data found")
                }
            })
    }
    pub fn time_until_expiry(&self) -> chrono::Duration {
        self.access_token.expires_at.naive_utc() - chrono::Utc::now().naive_utc()
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

pub type LoggedInResult = Result<LoggedInData, (StatusCode, Json<PwmResponse>)>;
#[async_trait]
impl<S> FromRequestParts<S> for LoggedInData
where
    PwmState: FromRef<S>,
    S: Send + Sync + core::fmt::Debug,
{
    type Rejection = (StatusCode, Json<PwmResponse>);

    // #[instrument(skip(parts, state))]
    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Some(access) = parts
            .extract::<HeaderMap>()
            .await
            .unwrap()
            .get("access_token")
            .cloned()
        else {
            tracing::warn!("access token was not provided");
            return Err((
                StatusCode::UNAUTHORIZED,
                PwmResponse::failure("access token was not provided", Some("try logging in"))
                    .into(),
            ));
        };
        let access_messed_up = PwmResponse::failure("nice fucked up access token btw", None);
        let access_messed_err = (StatusCode::UNAUTHORIZED, Json(access_messed_up));

        let Extension(ready_cache): Extension<ReadyCache<LoggedInResult>> =
            parts.extract_with_state(state).await.unwrap();
        let access = access.to_str().or(Err(access_messed_err.clone()))?;
        debug!("checking cache for data");
        let State(db): State<PwmState> = parts.extract_with_state(state).await.unwrap();
        let access = access.to_string();
        let ret = ready_cache
            .get_or_process(access.to_string(), || {
                Box::pin(async move {
                    let access_token_uuid =
                        Uuid::from_str(&access).or(Err(access_messed_err.clone()))?;
                    let data = LoggedInData::from_token_id(&access_token_uuid, db.deref())
                        .await
                        .transpose()
                        .ok_or(access_messed_err.clone())?
                        .or(Err(access_messed_err));
                    debug!("finished processing token");
                    data
                })
            })
            .map_err(|x| match x {
                BroadcastType::Sender(x) => x.subscribe(),
                BroadcastType::Receiver(x) => x,
            });
        match ret {
            Ok(x) => {
                debug!("data was stored in cache.");
                x
            }
            Err(mut r) => {
                debug!("data in reciever, waiting.");
                match r.recv().await {
                    Ok(x) => {
                        debug!("reciever sent data!");
                        x
                    }
                    Err(_) => {
                        error!("broadcast channel closed");
                        Err((
                            StatusCode::INTERNAL_SERVER_ERROR,
                            PwmResponse::failure("broadcast channel closed", None).into(),
                        ))
                    }
                }
            }
        }
    }
}
