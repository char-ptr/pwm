#! /usr/bin/sh
docker compose up db -d
cargo sqlx migrate run
docker compose watch
