import { Socket } from 'net'
import promClient from 'prom-client'
import { Response, SuperAgentRequest } from 'superagent'
import UrlValueParser from 'url-value-parser'

const requestHistogram = new promClient.Histogram({
  name: 'http_client_requests',
  help: 'Timings and counts of http client requests',
  buckets: [0.5, 0.75, 0.95, 0.99, 1],
  labelNames: ['clientName', 'method', 'uri', 'status'],
})

const timeoutCounter = new promClient.Counter({
  name: 'http_client_requests_timeout',
  help: 'Count of http client request timeouts',
  labelNames: ['clientName', 'method', 'uri'],
})

function restClientMetricsMiddleware(agent: SuperAgentRequest) {
  agent.on('request', ({ req }) => {
    const { hostname } = new URL(agent.url)
    const normalizedPath = normalizePath(req.path)
    const startTime = Date.now()

    req.on('socket', (socket: Socket) => {
      socket.on('timeout', () => {
        timeoutCounter.labels(hostname, req.method, normalizedPath).inc()
      })
    })

    req.on('response', (res: Response, err: Error) => {
      res.on('end', () => {
        const responseTime = Date.now() - startTime
        requestHistogram.labels(hostname, req.method, normalizedPath, String(res.statusCode)).observe(responseTime)
      })
    })
  })

  return agent
}

function normalizePath(path: string) {
  const urlPathReplacement = '#val'
  const urlValueParser = new UrlValueParser()
  return urlValueParser.replacePathValues(path, urlPathReplacement)
}

export { restClientMetricsMiddleware, requestHistogram, timeoutCounter }
