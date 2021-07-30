#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
readonly FAKE_MANAGE_RECALLS_API_LOG_FILE="/tmp/fake-manage-recalls-api.log"
readonly FAKE_MANAGE_RECALLS_API_PORT=9091

docker compose -f "${DOCKER_COMPOSE_FILE}" up hmpps-auth redis -d --remove-orphans

source "${SCRIPT_DIR}/restart-fake-manage-recalls-api.sh"

printf "\nChecking hmpps-auth is running..."
docker run --network container:hmpps-auth \
    appropriate/curl -s -4 --retry 120 --retry-delay 1 --retry-connrefused http://localhost:8080/auth/health/ping || (echo "...FAILED, please check 'docker logs hmpps-auth'"; exit 1)

echo
echo "Logs can be found by running:"
echo "  less ${FAKE_MANAGE_RECALLS_API_LOG_FILE}"
echo "  docker logs hmpps-auth"
echo "  docker logs redis"