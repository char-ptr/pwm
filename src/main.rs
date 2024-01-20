use std::{error::Error, path::PathBuf, str::FromStr, sync::Arc};

use axum::{http::Uri, routing::get, Router};
use clap::{Args, Parser};
use pwm::db::init_db;
use sqlx::{postgres::PgConnectOptions, ConnectOptions};

async fn test_route() -> &'static str {
    "server works"
}

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct ClapCli {
    #[clap(flatten)]
    database: DatabaseOptsOrUri,
}
#[derive(Args)]
struct DatabaseOptsOrUri {
    #[clap(flatten)]
    options: DatabaseOptions,
    #[clap(conflicts_with_all = ["host","port","username","pw_str"],long, short = 'i')]
    uri: Option<String>,
}
#[derive(Args, Clone)]
struct DatabaseOptions {
    #[clap(requires = "port", long, short = 'z')]
    host: Option<String>,
    #[clap(requires = "username", long, short)]
    port: Option<u16>,
    #[clap(requires = "pw_str", long, short)]
    username: Option<String>,
    /// will first check if it is a file, and instead use that instead of the value
    #[clap(long = "db-pw")]
    pw_str: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let _ = dotenvy::dotenv();

    let args = ClapCli::parse();

    let db_opts: PgConnectOptions = std::env::var("DATABASE_URL")
        .ok()
        .or(args.database.uri)
        .and_then(|x| PgConnectOptions::from_str(&x).ok())
        .or_else(|| {
            let arg_db = args.database.options;
            let pgco = PgConnectOptions::new()
                .username(arg_db.username?.as_str())
                .password(arg_db.pw_str?.as_str())
                .host(arg_db.host?.as_str())
                .port(arg_db.port?);
            Some(pgco)
        })
        .expect("Unable to get db config from env or args.");

    let db_pool = init_db(db_opts).await?;

    let app = Router::new()
        .route("/test", get(test_route))
        .with_state(db_pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:6087").await.unwrap();
    println!("Server running on port 6087");
    axum::serve(listener, app).await.unwrap();
    Ok(())
}
