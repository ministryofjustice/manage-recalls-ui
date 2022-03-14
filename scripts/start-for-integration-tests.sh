#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly MANAGE_RECALLS_UI_NAME='manage-recalls-ui'
readonly LOG_FILE="/tmp/${MANAGE_RECALLS_UI_NAME}-int-tests.log"
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

. ${SCRIPT_DIR}/install-cypress.sh
checkCypressInstalled $PROJECT_DIR

docker compose -f "${DOCKER_COMPOSE_FILE}" stop fake-manage-recalls-api redis
docker rm fake-manage-recalls-api || true
docker compose build fake-manage-recalls-api

docker compose -f "${DOCKER_COMPOSE_FILE}" pull fake-manage-recalls-api redis
docker compose -f "${DOCKER_COMPOSE_FILE}" up fake-manage-recalls-api redis -d --remove-orphans

echo "Checking wiremock is running..."
curl -s -4 -o /dev/null --retry 120 --retry-delay 1 --retry-all-errors http://localhost:8080/__admin/docs

echo "Installing ${MANAGE_RECALLS_UI_NAME}"
npm install

echo "Logs can be found by running:"
echo "  less /tmp/${LOG_FILE}"
echo "  docker logs fake-manage-recalls-api"
echo "  docker logs redis"

echo "Starting ${MANAGE_RECALLS_UI_NAME}, logs can be found here: ${LOG_FILE}"
npm run start:feature >>"${LOG_FILE}" 2>&1 &
sleep 5

echo
echo "Checking ${MANAGE_RECALLS_UI_NAME} is running..."
curl -s -4 --retry 20 -o /dev/null --retry-delay 2 --retry-all-errors http://localhost:3000/ping || (
    echo "...FAILED, please check ${LOG_FILE}"
    exit 1
)
echo "...done"
echo "To start the integration tests run: "
echo "npm run int-test"
echo "OR"
echo "npm run int-test-ui"
echo "OR"
echo "DEBUG=cypress:* npm run int-test-ui"
