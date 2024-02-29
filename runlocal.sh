#! /usr/bin/sh
docker compose up db -d
sea migrate
RUST_LOG=none,pwm=debug cargo watch -x "run --release"
