#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"=
readonly LOG_FILE="/tmp/${MANAGE_RECALLS_UI_NAME}.log"
readonly FAKE_MANAGE_RECALLS_API_LOG_FILE="/tmp/fake-manage-recalls-api.log"
readonly FAKE_MANAGE_RECALLS_API_PORT=9091

docker compose -f "${DOCKER_COMPOSE_FILE}" up hmpps-auth redis -d --remove-orphans

npx kill-port $FAKE_MANAGE_RECALLS_API_PORT
echo "Starting fake-manage-recalls-api, logs can be found here: ${FAKE_MANAGE_RECALLS_API_LOG_FILE}"
java -jar fake-manage-recalls-api/wiremock-standalone-2.27.2.jar --port ${FAKE_MANAGE_RECALLS_API_PORT} --verbose true --root-dir fake-manage-recalls-api/stubs >> "${FAKE_MANAGE_RECALLS_API_LOG_FILE}" 2>&1 &

printf "\nChecking hmpps-auth is running..."
docker run --network container:hmpps-auth \
    appropriate/curl -s -4 --retry 120 --retry-delay 1 --retry-connrefused http://localhost:8080/auth/health/ping || (echo "...FAILED, please check 'docker logs hmpps-auth'"; exit 1)
