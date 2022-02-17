import express from 'express'
import promBundle from 'express-prom-bundle'

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  autoregister: false,
  normalizePath: [['^/assets/.+$', '/assets/#assetPath']],
})

function metricsPort(): number {
  let port = 3000
  if (process.env.PORT != null) {
    port = Number(process.env.PORT)
  }
  return port + 1
}

function createMetricsApp(): express.Application {
  const metricsApp = express()
  metricsApp.use(metricsMiddleware.metricsMiddleware)
  metricsApp.set('port', metricsPort())
  return metricsApp
}

export { metricsMiddleware, createMetricsApp }
