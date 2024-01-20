use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{query, PgConnection};
use uuid::Uuid;

#[derive(Default, Debug, Deserialize, Serialize)]
pub struct User {
    pub(crate) user_id: Uuid,
    first_name: String,
    username: String,
    password: String,
    content_key: String,
    created_at: DateTime<Utc>,
}
#[derive(Default, Debug, Deserialize, Serialize)]
pub struct AccessToken {
    user_id: Uuid,
    access_token: Uuid,
    expire_at: DateTime<Utc>,
}
impl AccessToken {
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
    pub fn extend(&mut self, by: Duration) -> &DateTime<Utc> {
        self.expire_at += by;
        &self.expire_at
    }
    pub fn expires(&self) -> &DateTime<Utc> {
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
            self.expire_at.naive_utc(),
            self.access_token
        )
        .execute(db)
        .await
        .and(Ok(()))
    }
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "insert into pwm_access_token (user_id, access_token,expire_at) values ($1, $2, $3) on conflict (user_id) do nothing",
            self.user_id,
            self.access_token,
            self.expire_at.naive_utc()
        )
        .execute(db)
        .await
        .and(Ok(()))
    }
}
impl User {
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "insert into pwm_users (user_id, first_name, username, password, user_created_at, content_key) values ($1, $2, $3, $4, $5, $6) on conflict do nothing",
            self.user_id,
            self.first_name,
            self.username,
            self.password,
            self.created_at.naive_utc(),
            self.content_key

        )
        .execute(db)
        .await
        .and(Ok(()))
    }
    pub fn create_access_token(&self, duration: Duration) -> AccessToken {
        AccessToken {
            user_id: self.user_id,
            expire_at: Utc::now() + duration,
            access_token: Uuid::new_v4(),
        }
    }

    pub fn new(
        username: String,
        password: String,
        content_key: String,
        first_name: Option<String>,
    ) -> Self {
        let first_name = first_name.unwrap_or_default();
        Self {
            username,
            password,
            content_key,
            first_name,
            user_id: Uuid::new_v4(),
            created_at: Utc::now(),
        }
    }
}
