#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."

docker compose -f $PROJECT_DIR/docker-compose-with-api-and-mocks.yml stop

npx kill-port 3000