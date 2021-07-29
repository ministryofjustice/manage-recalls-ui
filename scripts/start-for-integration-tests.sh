#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly MANAGE_RECALLS_UI_NAME='manage-recalls-ui'
readonly LOG_FILE="/tmp/${MANAGE_RECALLS_UI_NAME}-int-tests.log"
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

. ${SCRIPT_DIR}/install-cypress.sh
checkCypressInstalled $PROJECT_DIR

npx kill-port 3000 9091

docker compose -f "${DOCKER_COMPOSE_FILE}" stop fake-manage-recalls-api redis
docker rm fake-manage-recalls-api || true
docker build fake-manage-recalls-api

docker compose -f "${DOCKER_COMPOSE_FILE}" pull fake-manage-recalls-api redis
docker compose -f "${DOCKER_COMPOSE_FILE}" up fake-manage-recalls-api redis -d --remove-orphans

echo "Checking wiremock is running..."
docker run --network container:fake-manage-recalls-api \
    appropriate/curl -s -4 -o /dev/null --retry 120 --retry-delay 1 --retry-connrefused http://localhost:8080/__admin/docs

echo "Building ${MANAGE_RECALLS_UI_NAME}"
npm install && npm run build

echo "Logs can be found by running:"
echo "  less /tmp/${LOG_FILE}"
echo "  docker logs fake-manage-recalls-api"
echo "  docker logs redis"

echo "Starting ${MANAGE_RECALLS_UI_NAME}, logs can be found here: ${LOG_FILE}"
npm run start-feature >> "${LOG_FILE}" 2>&1 &

echo
echo "Checking ${MANAGE_RECALLS_UI_NAME} is running..."
curl -s -4 --retry 10 -o /dev/null --retry-delay 1 --retry-connrefused http://localhost:3000/ping || (echo "...FAILED, please check ${LOG_FILE}"; exit 1)
echo "...done"
echo "To start the integration tests run: "
echo "npm run int-test"
echo "OR"
echo "npm run int-test-ui"
echo "OR"
echo "DEBUG=cypress:* npm run int-test-ui"
