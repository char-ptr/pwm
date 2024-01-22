use std::{ops::Deref, sync::LazyLock};

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, IntoActiveModel, LoaderTrait, QueryFilter, Set,
};

use crate::{
    db::entities::{vault, vault_item},
    errors::DB_ERR,
    extractors::logged_in::LoggedInData,
    PwmResponse, PwmState,
};

pub async fn new_item(
    State(db): State<PwmState>,
    access: LoggedInData,
    item: Json<vault_item::Model>,
) -> Result<Json<PwmResponse<vault_item::Model>>, (StatusCode, Json<PwmResponse>)> {
    let vault = vault::Entity::find()
        .filter(vault::Column::UserId.eq(access.user_id))
        .all(db.deref())
        .await
        .map_err(|x| {
            tracing::error!("error listing root items: {}", x);
            DB_ERR
        })?;
    let vault = vault.first().unwrap();
    let mut item_act = item.0.into_active_model();
    item_act.vault_id = Set(vault.vault_id);
    item_act.item_id = Set(uuid::Uuid::new_v4());

    let ret_item = item_act.insert(db.deref()).await.map_err(|x| {
        tracing::error!("error inserting item: {}", x);
        DB_ERR
    })?;
    Ok(Json(PwmResponse::success(ret_item)))
}
pub async fn list_root_items(
    State(db): State<PwmState>,
    access: LoggedInData,
) -> Result<Json<PwmResponse<Vec<vault_item::Model>>>, (StatusCode, Json<PwmResponse>)> {
    let vault = vault::Entity::find()
        .filter(vault::Column::UserId.eq(access.user_id))
        .all(db.deref())
        .await
        .map_err(|x| {
            tracing::error!("error listing root items: {}", x);
            DB_ERR
        })?;
    // .ok_or(DB_ERR)?;
    let vault_items = vault
        .load_many(
            vault_item::Entity::find().filter(vault_item::Column::FolderId.is_null()),
            db.deref(),
        )
        .await
        .map_err(|x| {
            tracing::error!("error listing root items: {}", x);
            DB_ERR
        })?
        .first()
        .unwrap()
        .clone();
    Ok(Json(PwmResponse::success(vault_items)))
}

pub(crate) static VAULT_ROUTER: LazyLock<Router<PwmState>> = LazyLock::new(|| {
    Router::new()
        .route("/items", post(new_item))
        .route("/items", get(list_root_items))
});
