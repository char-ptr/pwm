pub mod entities;
pub mod models;
use migration::MigratorTrait;
// pub mod user;
// pub mod vault;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};

pub async fn init_db(database_opts: ConnectOptions) -> Result<DatabaseConnection, DbErr> {
    let pool = Database::connect(database_opts).await?;

    migration::Migrator::up(&pool, None).await?;

    Ok(pool)
}
