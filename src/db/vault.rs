use serde::{Deserialize, Serialize};
use sqlx::PgConnection;
use uuid::Uuid;

use super::user::User;

#[derive(Default, Serialize, Clone, Debug)]
pub struct VaultFolder {
    parent_folder_id: Option<Uuid>,
    vault_id: Uuid,
    folder_id: Uuid,
    name: String,
    icon_url: Option<String>,
}
#[derive(Default, Deserialize, Serialize, Clone, Debug)]
pub struct VaultItem {
    vault_id: Uuid,
    item_id: Uuid,
    folder_id: Option<Uuid>,
    name: String,
    username: Option<String>,
    password: Option<String>,
    icon_url: Option<String>,
    notes: Option<String>,
    custom_fields: Option<serde_json::Value>,
}
#[derive(Default, Debug)]
pub struct Vault {
    vault_id: Uuid,
    user_id: Uuid,
}

impl VaultFolder {
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!("insert into pwm_vault_folder (parent_folder_id, vault_id, folder_id, name, icon_url) values ( $1, $2, $3, $4, $5 ) on conflict do nothing", self.parent_folder_id, self.vault_id, self.folder_id, self.name, self.icon_url).execute(db).await.and(Ok(()))
    }
}
impl VaultItem {
    pub async fn commit_to_db(&self, db: &mut PgConnection) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "insert into pwm_vault_item (vault_id, item_id, folder_id, name, username, password, icon_url,notes,custom_fields) values ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) on conflict do nothing",
            self.vault_id,
            self.item_id,
            self.folder_id,
            self.name, self.username, self.password, self.icon_url, self.notes, self.custom_fields
        ).execute(db).await.and(Ok(()))
    }
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
