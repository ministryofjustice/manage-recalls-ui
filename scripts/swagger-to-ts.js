const superagent = require('superagent')
const OpenAPI = require('openapi-typescript-codegen')
const fs = require('fs')

const swaggerUrl = 'https://manage-recalls-api-dev.hmpps.service.justice.gov.uk/v2/api-docs'

superagent.get(swaggerUrl).then(({ body }) => {
  const outputPath = './server/@types/manage-recalls-api'
  OpenAPI.generate({
    input: body,
    output: outputPath,
    exportCore: false,
    exportServices: false,
  }).then(() => {
    fs.closeSync(fs.openSync(`${outputPath}/models/index.d.ts`, 'w'))
    fs.rename(`${outputPath}/index.ts`, `${outputPath}/index.d.ts`, err => {
      // eslint-disable-next-line no-console
      if (err) console.error(err)
    })
  })
})
