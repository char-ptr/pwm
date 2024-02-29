use sea_orm::{ActiveValue::NotSet, Set};
use uuid::Uuid;

use crate::db::entities::{
    prelude::Vault, sea_orm_active_enums::VaultOwner, user, vault, vault_item, vault_website_entry,
};

impl Vault {
    pub fn make_from_user(user: &user::Model) -> vault::ActiveModel {
        vault::ActiveModel {
            vault_id: Set(Uuid::new_v4()),
            user_id: Set(Some(user.user_id)),
            group_id: NotSet,
            owner_type: Set(Some(VaultOwner::User)),
        }
    }
}
#[derive(Debug, serde::Deserialize, serde::Serialize, Clone)]
pub struct VaultItemWithWebsites {
    pub item: vault_item::Model,
    pub websites: Box<[vault_website_entry::Model]>,
}
impl vault_item::Model {
    pub fn attach_websites(
        self,
        websites: Vec<vault_website_entry::Model>,
    ) -> VaultItemWithWebsites {
        VaultItemWithWebsites {
            item: self,
            websites: websites.into_boxed_slice(),
        }
    }
}
