#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
readonly MANAGE_RECALLS_UI_NAME='manage-recalls-ui'
readonly LOG_FILE="/tmp/${MANAGE_RECALLS_UI_NAME}.log"
readonly FAKE_MANAGE_RECALLS_API_LOG_FILE="/tmp/fake-manage-recalls-api.log"
readonly MANAGE_RECALLS_UI_PORT=3000
readonly FAKE_MANAGE_RECALLS_API_PORT=9091

docker compose -f "${DOCKER_COMPOSE_FILE}" up hmpps-auth redis -d --remove-orphans

npx kill-port $FAKE_MANAGE_RECALLS_API_PORT $MANAGE_RECALLS_UI_PORT
echo "Starting fake-manage-recalls-api, logs can be found here: ${FAKE_MANAGE_RECALLS_API_LOG_FILE}"
java -jar fake-manage-recalls-api/wiremock-standalone-2.27.2.jar --port ${FAKE_MANAGE_RECALLS_API_PORT} --verbose true --root-dir fake-manage-recalls-api/stubs >> "${FAKE_MANAGE_RECALLS_API_LOG_FILE}" 2>&1 &

echo "Starting ${MANAGE_RECALLS_UI_NAME}, logs can be found here: ${LOG_FILE}"
npm run build
npm run start:dev >> "${LOG_FILE}" 2>&1 &

printf "\nChecking hmpps-auth is running..."
docker run --network container:hmpps-auth \
    appropriate/curl -s -4 --retry 120 --retry-delay 1 --retry-connrefused http://localhost:8080/auth/health/ping || (echo "...FAILED, please check 'docker logs hmpps-auth'"; exit 1)

echo
echo "Checking ${MANAGE_RECALLS_UI_NAME} is running..."
curl -s -4 --retry 10 -o /dev/null --retry-delay 1 --retry-connrefused http://localhost:3000/ping || (echo "...FAILED, please check 'docker logs manage-recalls-ui'"; exit 1)
echo "...done"
echo
echo "Logs can be found by running:"
echo "  less ${LOG_FILE}"
echo "  less ${FAKE_MANAGE_RECALLS_API_LOG_FILE}"
echo "  docker logs hmpps-auth"
echo "  docker logs redis"
echo "http://localhost:3000"
