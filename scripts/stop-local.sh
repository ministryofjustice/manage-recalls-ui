#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"

docker compose -f $DOCKER_COMPOSE_FILE stop

npx kill-port 3000 9091