use sqlx::{postgres::PgConnectOptions, PgPool};

pub async fn init_db(database_opts: PgConnectOptions) -> Result<PgPool, sqlx::Error> {
    let pool = PgPool::connect_with(database_opts).await?;

    sqlx::migrate!().run(&pool).await?;

    Ok(pool)
}
