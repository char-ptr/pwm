use std::{error::Error, fs::File, io::Read, net::SocketAddr, path::Path};

use clap::{Args, Parser};
use pwm::{db::init_db, routes::construct_router, SecureIp};
use sea_orm::ConnectOptions;
use tracing::{info};
use tracing_subscriber::{layer::SubscriberExt, EnvFilter, Registry};
use tracing_tree::HierarchicalLayer;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct ClapCli {
    #[clap(flatten)]
    database: DatabaseOptsOrUri,
    #[clap(default_value = "connect-info", long)]
    secure_ip: SecureIp,
    #[clap(default_value = "6087", long, short = 'p')]
    port: u16,
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
    #[clap(requires = "db_port", long, short = 'z')]
    host: Option<String>,
    #[clap(requires = "username", long, short = 'x')]
    db_port: Option<u16>,
    #[clap(requires = "pw_str", long, short)]
    username: Option<String>,
    #[clap(default_value = "pwm", long, short)]
    database: String,
    /// will first check if it is a file, and instead use that instead of the value
    #[clap(long = "db-pw")]
    pw_str: Option<String>,
}

fn read_file_string(possible_file: &str) -> Option<String> {
    let as_pth = Path::new(possible_file);
    as_pth.is_file().then_some(()).and_then(|_| {
        let mut buf = String::new();
        let mut file = File::open(as_pth).ok()?;

        file.read_to_string(&mut buf).ok()?;

        Some(buf)
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let layer = HierarchicalLayer::default()
        .with_writer(std::io::stdout)
        .with_indent_lines(true)
        .with_indent_amount(2)
        .with_thread_names(true)
        .with_thread_ids(true)
        // .with_verbose_exit(false)
        // .with_verbose_entry(false)
        .with_targets(true);

    let subscriber = Registry::default()
        .with(layer)
        .with(EnvFilter::from_default_env());
    tracing::subscriber::set_global_default(subscriber).unwrap();
    // tracing_subscriber::fmt()
    //     .with_test_writer()
    //     .with_max_level(Level::TRACE)
    //     .init();
    let _ = dotenvy::dotenv();

    let args = ClapCli::parse();

    let db_opts: ConnectOptions = std::env::var("DATABASE_URL")
        .ok()
        .or(args.database.uri)
        .map(ConnectOptions::new)
        .or_else(|| {
            let arg_db = args.database.options;
            let pw_str = arg_db.pw_str?;
            let pw = read_file_string(&pw_str).unwrap_or(pw_str);
            let conn_str = format!(
                "postgres://{}:{}@{}:{}/{}",
                arg_db.username?,
                pw.trim(),
                arg_db.host?,
                arg_db.db_port?,
                arg_db.database
            );
            // let pgco = ConnectOptions::new(())
            //     .username(arg_db.username?.as_str())
            //     .host(arg_db.host?.as_str())
            //     .port(arg_db.port?)
            //     .password(pw.trim());
            Some(ConnectOptions::new(conn_str))
        })
        .expect("Unable to get db config from env or args.");

    let db_pool = init_db(db_opts).await?;

    let app_router = construct_router(db_pool, args.secure_ip.into());
    let listener = tokio::net::TcpListener::bind("0.0.0.0:6087").await.unwrap();
    info!("Server started {:?}", args.port);
    axum::serve(
        listener,
        app_router.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
    Ok(())
}
