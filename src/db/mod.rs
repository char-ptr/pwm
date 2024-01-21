pub mod user;
pub mod vault;
use sqlx::{postgres::PgConnectOptions, ConnectOptions, PgPool};

//test
pub async fn init_db(database_opts: PgConnectOptions) -> Result<PgPool, sqlx::Error> {
    let pool = PgPool::connect_with(database_opts).await?;

    sqlx::migrate!().run(&pool).await?;

    Ok(pool)
}
