#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly FAKE_MANAGE_RECALLS_API_LOG_FILE="/tmp/fake-manage-recalls-api.log"
readonly FAKE_MANAGE_RECALLS_API_PORT=9091

npx kill-port $FAKE_MANAGE_RECALLS_API_PORT
echo "Restarting fake-manage-recalls-api, logs can be found here: ${FAKE_MANAGE_RECALLS_API_LOG_FILE}"
java -jar fake-manage-recalls-api/wiremock-standalone-2.27.2.jar --port $FAKE_MANAGE_RECALLS_API_PORT --verbose true --root-dir fake-manage-recalls-api/stubs >> "${FAKE_MANAGE_RECALLS_API_LOG_FILE}" 2>&1 &
echo "Done"