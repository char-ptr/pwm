use std::{ops::Deref, sync::LazyLock};

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use futures::{stream::FuturesUnordered, StreamExt};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, EntityTrait, IntoActiveModel, LoaderTrait,
    QueryFilter, Set, Statement,
};
use serde_json::Value;
use tokio::pin;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    db::{
        entities::{
            sea_orm_active_enums::WebsiteMatchDetection, vault, vault_folder, vault_item,
            vault_website_entry,
        },
        models::vault_ex::VaultItemWithWebsites,
    },
    errors::DB_ERR,
    extractors::logged_in::LoggedInData,
    PwmResponse, PwmState,
};

#[instrument]
pub async fn new_folder(
    State(db): State<PwmState>,
    access: LoggedInData,
    folder: Json<vault_folder::Model>,
) -> Result<Json<PwmResponse<vault_folder::Model>>, (StatusCode, Json<PwmResponse>)> {
    let vault = vault::Entity::find()
        .filter(vault::Column::UserId.eq(access.user_id))
        .all(db.deref())
        .await
        .map_err(|x| {
            tracing::error!("error listing root items: {}", x);
            DB_ERR
        })?;
    let vault = vault.first().unwrap();
    let mut folder_act = folder.0.into_active_model();
    folder_act.folder_id = Set(uuid::Uuid::new_v4());
    folder_act.vault_id = Set(vault.vault_id);
    let ret_folder = folder_act.insert(db.deref()).await.map_err(|x| {
        tracing::error!("error inserting folder: {}", x);
        DB_ERR
    })?;
    Ok(Json(PwmResponse::success(ret_folder)))
}
#[derive(Debug, serde::Deserialize)]
pub struct MoveItemsRequest {
    item_ids: Vec<uuid::Uuid>,
    folder_id: uuid::Uuid,
}
#[instrument]
pub async fn move_items(
    State(db): State<PwmState>,
    access: LoggedInData,
    request: Json<MoveItemsRequest>,
) -> Result<Json<PwmResponse<()>>, (StatusCode, Json<PwmResponse>)> {
    let res = db.execute(Statement::from_sql_and_values(sea_orm::DatabaseBackend::Postgres, r#"update vault_item vi set folder_id = $3 from vault left outer join "user" on vault.user_id = "user".user_id where "user".user_id = $1 and vi.item_id in $2 and vault.vault_id = vi.vault_id"#,vec![access.user().user_id.into(),request.item_ids.clone().into(), request.folder_id.into()])).await;
    if let Err(x) = res {
        tracing::error!("error moving items: {}", x);
        return Err(DB_ERR);
    }
    Ok(Json(PwmResponse::success(())))
}
#[derive(Debug, serde::Deserialize)]
pub struct NewItemRequest {
    pub folder_id: Option<Uuid>,
    pub name: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub notes: Option<String>,
    pub custom_fields: Option<Value>,
    pub icon_url: Option<String>,
    pub websites: Vec<WebsiteEntrySmol>,
}
#[derive(Debug, serde::Deserialize)]
pub struct WebsiteEntrySmol {
    uri: String,
    match_detection: Option<WebsiteMatchDetection>,
}

pub async fn new_item(
    State(db): State<PwmState>,
    access: LoggedInData,
    item: Json<NewItemRequest>,
) -> Result<Json<PwmResponse<VaultItemWithWebsites>>, (StatusCode, Json<PwmResponse>)> {
    let vault = vault::Entity::find()
        .filter(vault::Column::UserId.eq(access.user_id))
        .all(db.deref())
        .await
        .map_err(|x| {
            tracing::error!("error listing root items: {}", x);
            DB_ERR
        })?;
    let vault = vault.first().unwrap();
    // move NewItemRequest into the active model
    let item = item.0;
    let mut item_act = vault_item::ActiveModel {
        folder_id: Set(item.folder_id),
        name: Set(item.name),
        username: Set(item.username),
        password: Set(item.password),
        notes: Set(item.notes),
        custom_fields: Set(item.custom_fields),
        icon_url: Set(item.icon_url),
        vault_id: Set(vault.vault_id),
        item_id: Set(uuid::Uuid::new_v4()),
    };
    let t_db = &db.clone();
    let websites_stream = FuturesUnordered::new();
    for x in item.websites.iter() {
        let fut = vault_website_entry::ActiveModel {
            uri: Set(x.uri.clone()),
            match_detection: Set(x.match_detection.clone()),
            ..Default::default()
        }
        .insert(t_db.deref());
        websites_stream.push(fut);
    }
    item_act.vault_id = Set(vault.vault_id);
    item_act.item_id = Set(uuid::Uuid::new_v4());
    let item_insert = item_act.insert(db.deref());
    // let item_insert.
    let ret_item = item_insert.await.map_err(|x| {
        tracing::error!("error inserting item: {}", x);
        DB_ERR
    })?;
    pin!(websites_stream);
    let mut websites = Vec::with_capacity(item.websites.len());
    while let Some(x) = websites_stream.next().await {
        let x = x.map_err(|x| {
            tracing::error!("error inserting website entry: {}", x);
            DB_ERR
        })?;
        websites.push(x);
    }

    Ok(Json(PwmResponse::success(
        ret_item.attach_websites(websites),
    )))
}
type RetLong = Result<Json<PwmResponse<Vec<vault_item::Model>>>, (StatusCode, Json<PwmResponse>)>;
#[instrument]
pub async fn list_root_items(State(db): State<PwmState>, access: LoggedInData) -> RetLong {
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
        .route("/folders", post(new_folder))
        .route("/move", post(move_items))
});
