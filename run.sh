#! /usr/bin/sh
docker compose up db -d
sea migrate
docker compose watch
