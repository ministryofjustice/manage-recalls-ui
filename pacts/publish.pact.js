const pact = require('@pact-foundation/pact-node')
const gitHash = require('child_process')

if (!process.env.CI && !process.env.PUBLISH_PACT) {
  console.log('skipping Pact publish...')
  process.exit(0)
}

const pactBrokerUrl = process.env.PACT_BROKER_URL || 'http://localhost:9292'
const pactBrokerUsername = process.env.PACT_BROKER_USERNAME || 'manage_recalls'
const pactBrokerPassword = process.env.PACT_BROKER_PASSWORD || 'manage_recalls'

const opts = {
  pactFilesOrDirs: ['./pacts/'],
  pactBroker: pactBrokerUrl,
  pactBrokerUsername,
  pactBrokerPassword,
  tags: ['prod', 'test'],
  consumerVersion: gitHash.execSync('git rev-parse --short HEAD').toString().trim(),
}

pact
  .publishPacts(opts)
  .then(() => {
    console.log('Pact contract publishing complete!')
    console.log('')
    console.log(`Head over to ${pactBrokerUrl} and login with`)
    console.log(`=> Username: ${pactBrokerUsername}`)
    console.log(`=> Password: ${pactBrokerPassword}`)
    console.log('to see your published contracts.')
  })
  .catch(e => {
    console.log('Pact contract publishing failed: ', e)
  })
