pub mod entities;
pub mod models;
use migration::MigratorTrait;
// pub mod user;
// pub mod vault;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};
use tracing::log::LevelFilter;

pub async fn init_db(database_opts: ConnectOptions) -> Result<DatabaseConnection, DbErr> {
    let mut new_db_opts = database_opts;
    let pool = Database::connect(new_db_opts).await?;

    migration::Migrator::up(&pool, None).await?;

    Ok(pool)
}
