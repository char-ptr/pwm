use sea_orm::{ActiveValue::NotSet, Set};
use uuid::Uuid;

use crate::db::entities::{prelude::Vault, sea_orm_active_enums::VaultOwner, user, vault};

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
