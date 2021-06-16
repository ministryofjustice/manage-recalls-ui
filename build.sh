#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

function checkCypressInstalled() {
  local cypressBinaryString==`${SCRIPT_DIR}/node_modules/.bin/cypress version | grep "Cypress binary version:"`
  local cypressVersion=${cypressBinaryString:25}

  if [[ $cypressVersion == 'not installed' ]]; then
      echo "Cypress not installed"
      npm install --save-dev cypress
  else
      echo "Found Cypress binary version ${cypressVersion}"
  fi
}

function runBuild() {
  npm run local:build
}

checkCypressInstalled
runBuild
