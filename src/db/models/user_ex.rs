use std::ops::Deref;

use chrono::Duration;
use scrypt::{
    password_hash::{PasswordHash, PasswordVerifier},
    Scrypt,
};
use sea_orm::{
    prelude::DateTimeWithTimeZone, ColumnTrait, DbConn, DbErr, DerivePartialModel, EntityTrait,
    FromQueryResult, QueryFilter,
};
use serde::Serialize;
use uuid::Uuid;

use crate::{
    db::entities::{access_token, prelude::User, user},
    extractors::identifiable_device::IdentifiableDevice,
};

#[derive(DerivePartialModel, FromQueryResult, Serialize, Clone, Debug)]
#[sea_orm(entity = "User")]
pub struct UserTokens {
    pub content_key: String,
    pub content_iv: Vec<u8>,
    pub password_salt: Vec<u8>,
}
impl From<user::Model> for UserTokens {
    fn from(value: user::Model) -> Self {
        Self {
            content_key: value.content_key,
            content_iv: value.content_iv.unwrap(),
            password_salt: value.password_salt.unwrap(),
        }
    }
}
#[derive(DerivePartialModel, FromQueryResult, Serialize, Clone, Debug)]
#[sea_orm(entity = "User")]
pub struct InsensitiveUser {
    pub user_id: Uuid,
    pub alias: String,
    pub username: String,
    pub user_created_at: DateTimeWithTimeZone,
}
impl From<user::Model> for InsensitiveUser {
    fn from(value: user::Model) -> Self {
        Self {
            username: value.username,
            user_id: value.user_id,
            alias: value.alias,
            user_created_at: value.user_created_at,
        }
    }
}

impl User {
    pub async fn lookup_username(
        username: &str,
        db: &DbConn,
    ) -> Result<Option<user::Model>, DbErr> {
        Self::find()
            .filter(user::Column::Username.eq(username))
            .one(db)
            .await
    }
}
impl user::Model {
    pub fn make_access_token(
        &self,
        dur: Duration,
        device: &IdentifiableDevice,
    ) -> access_token::Model {
        access_token::Model {
            token: uuid::Uuid::new_v4(),
            user_id: self.user_id,
            expires_at: (chrono::Utc::now() + dur).fixed_offset(),
            ip_valid: device.ip.to_string(),
            user_agent: device.user_agent.to_string(),
        }
    }
    pub fn check_password(&self, other: &str) -> Result<(), ()> {
        let hash = PasswordHash::new(&self.password).map_err(|_| ())?;
        Scrypt
            .verify_password(other.as_bytes(), &hash)
            .map_err(|_| ())
    }
}
