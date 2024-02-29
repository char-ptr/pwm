pub mod entities;
pub mod models;
use migration::MigratorTrait;
// pub mod user;
// pub mod vault;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};
use tracing::log::LevelFilter;

pub async fn init_db(mut database_opts: ConnectOptions) -> Result<DatabaseConnection, DbErr> {
    let new_db_opts = database_opts
        .sqlx_logging_level(LevelFilter::Info) // Or set SQLx log level
        .sqlx_logging(false);

    let pool = Database::connect(new_db_opts.clone()).await?;

    migration::Migrator::up(&pool, None).await?;
    //a

    Ok(pool)
}
