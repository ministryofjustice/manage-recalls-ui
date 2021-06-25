#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly MANAGE_RECALLS_UI_NAME='manage-recalls-ui'
readonly LOG_FILE="/tmp/${MANAGE_RECALLS_UI_NAME}.log"
readonly START_SERVICE=${1:-wiremock}
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose-test.yml"

. ${SCRIPT_DIR}/install-cypress.sh
checkCypressInstalled $PROJECT_DIR

docker compose -f "${DOCKER_COMPOSE_FILE}" pull
docker compose -f "${DOCKER_COMPOSE_FILE}" up $START_SERVICE -d --remove-orphans

echo "Checking wiremock is running..."
docker run --network container:wiremock-manage-recalls-ui \
    appropriate/curl -s -4 -o /dev/null --retry 120 --retry-delay 1 --retry-connrefused http://localhost:8080/__admin/docs

echo "Building ${MANAGE_RECALLS_UI_NAME}"
npm install && npm run build

npx kill-port 3000
echo "Starting ${MANAGE_RECALLS_UI_NAME}"
npm run start-feature:dev >> "${LOG_FILE}" 2>&1 &

echo
echo "Checking ${MANAGE_RECALLS_UI_NAME} is running..."
curl -s -4 --retry 10 -o /dev/null --retry-delay 1 --retry-connrefused http://localhost:3000/ping
echo "...done"
