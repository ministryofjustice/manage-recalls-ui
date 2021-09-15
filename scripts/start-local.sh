#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
readonly MANAGE_RECALLS_UI_NAME='manage-recalls-ui'

docker compose -f "${DOCKER_COMPOSE_FILE}" stop
docker rm fake-manage-recalls-api || true
docker build fake-manage-recalls-api

docker build fake-prison-register-api

docker compose -f "${DOCKER_COMPOSE_FILE}" up -d --remove-orphans

echo "Logs can be found by running:"
echo "  docker logs manage-recalls-ui"
echo "  docker logs hmpps-auth"
echo "  docker logs fake-manage-recalls-api"
echo "  docker logs fake-prison-register-api"
echo "  docker logs redis"

printf "\nChecking hmpps-auth is running..."
docker run --network container:hmpps-auth \
    appropriate/curl -s -4 --retry 120 --retry-delay 1 --retry-connrefused http://localhost:8080/auth/health/ping || (echo "...FAILED, please check 'docker logs hmpps-auth'"; exit 1)

echo
echo "Checking ${MANAGE_RECALLS_UI_NAME} is running..."
curl -s -4 --retry 10 -o /dev/null --retry-delay 1 --retry-connrefused http://localhost:3000/ping || (echo "...FAILED, please check 'docker logs manage-recalls-ui'"; exit 1)
echo "...done"
echo "http://localhost:3000"
