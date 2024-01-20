use sqlx::PgConnection;
use uuid::Uuid;

use super::user::User;

#[derive(Default, Debug)]
pub struct Vault {
    vault_id: Uuid,
    user_id: Uuid,
}

impl Vault {
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "insert into pwm_vault (vault_id, user_id) values ($1, $2) on conflict do nothing",
            self.vault_id,
            self.user_id
        )
        .execute(db)
        .await
        .and(Ok(()))
    }
    pub fn new(owner: &User) -> Vault {
        Self {
            user_id: owner.user_id,
            vault_id: Uuid::new_v4(),
        }
    }
}
