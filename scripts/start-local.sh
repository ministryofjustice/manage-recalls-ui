#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="${SCRIPT_DIR}/.."
readonly MANAGE_RECALLS_SERVICE_NAME='manage-recalls-ui'
readonly LOG_FILE="/tmp/${MANAGE_RECALLS_SERVICE_NAME}.log"
readonly START_SERVICE=${1:-wiremock}
readonly DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose-test.yml"

case "$OSTYPE" in
  darwin*) OSX=true ;;
  *) OSX=false ;;
esac

function wait_till_service_started() {
  local readonly serviceName=$1
  local readonly serviceUrl=$2
  local i=1
  local spinner_steps="/-\|"
  local readonly service_start=$(date +%s)

  echo "Checking $serviceName is ready"

  while
    is_service_ready $serviceUrl
    ret=$?
    [[ ${ret} -ne 0 ]]
  do
    new_status=" \b${spinner_steps:i++%${#spinner_steps}:1}"
    update_status ${service_start} "${new_status}"
    sleep 0.25
  done
  update_status ${service_start} "SUCCESS\n"
}

function is_service_ready() {
  local readonly readiness_url=$1
  local readonly status="$(curl -s -o /dev/null -w ''%{http_code}'' "${readiness_url}")"

  if [[ "${status}" == "200" || "${status}" == "404" ]]; then
    return 0
  else
    return 1
  fi
}

function update_status() {
  local readonly start=$1
  local readonly status=$2

  if [[ "$OSX" == true ]]; then
    tput cuu1
    echo -ne "\n$((($(date +%s) - start)))s $status"
  elif [[ "$status" == "SUCCESS\n" || "$status" == "\033[31mFAILED\033[m\n" ]]; then
    echo -ne "$((($(date +%s) - start)))s $status"
  fi
}

docker compose -f "${DOCKER_COMPOSE_FILE}" pull
docker compose -f "${DOCKER_COMPOSE_FILE}" up $START_SERVICE -d --remove-orphans

npx kill-port 3000
echo "Starting $MANAGE_RECALLS_SERVICE_NAME"
npm install && npm run build && npm run start-feature >> "${LOG_FILE}" 2>&1 &

wait_till_service_started "$MANAGE_RECALLS_SERVICE_NAME" http://localhost:3000/ping

