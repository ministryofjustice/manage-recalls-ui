#!/bin/bash

set -euo pipefail

function checkCypressInstalled() {
  local cypressBinaryString==`${1}/node_modules/.bin/cypress version | grep "Cypress binary version:"`
  local cypressVersion=${cypressBinaryString:25}

  if [[ $cypressVersion == 'not installed' ]]; then
      echo "Cypress not installed"
      npm install --save-dev cypress
  else
      echo "Found Cypress binary version ${cypressVersion}"
  fi
}
