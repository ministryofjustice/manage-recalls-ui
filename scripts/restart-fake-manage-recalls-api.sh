#!/bin/bash

set -euo pipefail

function restartFakeManageRecallsApi() {
  local port="${FAKE_MANAGE_RECALLS_API_PORT:-9091}"
  local logFile="${FAKE_MANAGE_RECALLS_API_LOG_FILE:-/tmp/fake-manage-recalls-api.log}"
  npx kill-port $port
  echo "Restarting fake-manage-recalls-api, logs can be found here: ${logFile}"
  java -jar fake-manage-recalls-api/wiremock-standalone-2.27.2.jar --port $port --verbose true --root-dir fake-manage-recalls-api/stubs >> "${logFile}" 2>&1 &
  echo "Done"
}

restartFakeManageRecallsApi
