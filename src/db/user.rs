use chrono::{DateTime, Duration, NaiveDateTime, Utc};
use scrypt::{
    password_hash::{PasswordHash, PasswordVerifier},
    Scrypt,
};
use serde::{Deserialize, Serialize};
use sqlx::{query, PgConnection};
use uuid::Uuid;

#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct User {
    pub(crate) user_id: Uuid,
    first_name: Option<String>,
    username: String,
    password: String,
    content_key: String,
    user_created_at: NaiveDateTime,
}
#[derive(Clone, Default, Debug, Deserialize, Serialize)]
pub struct AccessToken {
    user_id: Uuid,
    access_token: Uuid,
    expire_at: NaiveDateTime,
}
impl AccessToken {
    pub async fn get_user(&self, db: &mut PgConnection) -> Result<User, sqlx::Error> {
        sqlx::query_as!(
            User,
            "select * from pwm_users where user_id = $1",
            self.user_id
        )
        .fetch_one(db)
        .await
    }
    pub async fn lookup(token: &Uuid, db: &mut PgConnection) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as!(
            AccessToken,
            "select * from pwm_access_token where access_token = $1",
            token
        )
        .fetch_optional(db)
        .await
    }
    pub async fn delete(self, db: &mut PgConnection) -> Result<(), (Self, sqlx::Error)> {
        query!(
            "delete from pwm_access_token where access_token = $1",
            self.access_token
        )
        .execute(db)
        .await
        .and(Ok(()))
        .map_err(|err| (self, err))
    }
    pub fn extend(&mut self, by: Duration) -> &NaiveDateTime {
        self.expire_at += by;
        &self.expire_at
    }
    pub fn expires(&self) -> &NaiveDateTime {
        &self.expire_at
    }
    pub fn token(&self) -> &Uuid {
        &self.access_token
    }
    pub fn user(&self) -> &Uuid {
        &self.user_id
    }
    pub async fn commit_time_update(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "update pwm_access_token set expire_at = $1 where access_token = $2",
            self.expire_at,
            self.access_token
        )
        .execute(db)
        .await
        .and(Ok(()))
    }
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        log::info!(
            "storing access_token({}) for user({})",
            self.access_token,
            self.user_id
        );
        sqlx::query!(
            "insert into pwm_access_token (user_id, access_token,expire_at) values ($1, $2, $3)",
            self.user_id,
            self.access_token,
            self.expire_at
        )
        .execute(db)
        .await
        .and(Ok(()))
    }
}
impl User {
    pub async fn lookup_username(
        username: &str,
        db: &mut PgConnection,
    ) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as!(
            User,
            "select * from pwm_users where username = $1",
            username
        )
        .fetch_optional(db)
        .await
    }
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "insert into pwm_users (user_id, first_name, username, password, user_created_at, content_key) values ($1, $2, $3, $4, $5, $6) on conflict do nothing",
            self.user_id,
            self.first_name,
            self.username,
            self.password,
            self.user_created_at,
            self.content_key

        )
        .execute(db)
        .await
        .and(Ok(()))
    }
    pub fn create_access_token(&self, duration: Duration) -> AccessToken {
        AccessToken {
            user_id: self.user_id,
            expire_at: (Utc::now() + duration).naive_utc(),
            access_token: Uuid::new_v4(),
        }
    }
    pub fn check_password(&self, other: &str) -> Result<(), ()> {
        let hash = PasswordHash::new(&self.password).map_err(|_| ())?;
        Scrypt
            .verify_password(other.as_bytes(), &hash)
            .map_err(|_| ())
    }

    pub fn new(
        username: String,
        password: String,
        content_key: String,
        first_name: Option<String>,
    ) -> Self {
        Self {
            username,
            password,
            content_key,
            first_name,
            user_id: Uuid::new_v4(),
            user_created_at: Utc::now().naive_utc(),
        }
    }
}
