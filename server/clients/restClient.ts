import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import promClient from 'prom-client'
// import UrlValueParser from 'url-value-parser'
import logNetworkTime from 'superagent-node-http-timings'

import UrlValueParser from 'url-value-parser'
import logger from '../../logger'
import sanitiseError from '../utils/sanitisedError'
import { ApiConfig } from '../config'

export interface GetRequest {
  path?: string
  query?: object | string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface PatchRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface DeleteRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

export const requestHistogram = new promClient.Histogram({
  name: 'http_client_requests',
  help: 'Timings and counts of http client requests',
  buckets: [0.5, 0.75, 0.95, 0.99, 1],
  labelNames: ['clientName', 'method', 'uri', 'status'],
})

export const timeoutCounter = new promClient.Counter({
  name: 'http_client_requests_timeout',
  help: 'Count of http client request timeouts',
  labelNames: ['clientName', 'method', 'uri'],
})

function normalizePath(path: string) {
  const urlPathReplacement = '#val'
  const urlValueParser = new UrlValueParser()
  return urlValueParser.replacePathValues(path, urlPathReplacement)
}

export default class RestClient {
  agent: Agent

  constructor(private readonly name: string, private readonly config: ApiConfig, private readonly token?: string) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  private logNetworkTimeCallback(err: Error, result: any) {
    const url = new URL(result.url)
    const { hostname } = url
    const path = normalizePath(url.pathname)

    console.error(err)
    console.error(result)
    if (err) {
      if (err.name === 'ETIMEDOUT') {
        timeoutCounter.labels(hostname, 'GET', path).inc()
      }
    }

    requestHistogram.labels(hostname, 'GET', path, String(result.status)).observe(result.timings.total)
  }

  retry(err?: { code: string; message: string }): void {
    if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
    return undefined // retry handler only for logging retries, not to influence retry logic
  }

  async get<T>({ path = null, query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<T> {
    try {
      let result
      if (this.token) {
        result = await superagent
          .get(`${this.apiUrl()}${path}`)
          .use(logNetworkTime(this.logNetworkTimeCallback))
          .agent(this.agent)
          .retry(2, this.retry)
          .query(query)
          .auth(this.token, { type: 'bearer' })
          .set(headers)
          .responseType(responseType)
          .timeout(this.timeoutConfig())
      } else {
        result = await superagent
          .get(`${this.apiUrl()}${path}`)
          .use(logNetworkTime(this.logNetworkTimeCallback))
          .agent(this.agent)
          .retry(2, this.retry)
          .query(query)
          .set(headers)
          .responseType(responseType)
          .timeout(this.timeoutConfig())
          .on('timeout', err => {
            console.error(err)
          })
      }

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.error(
        { ...sanitisedError, query },
        `Error calling ${this.name}, path: '${this.apiUrl()}${path}', verb: 'GET'`
      )
      throw sanitisedError
    }
  }

  async post<T>({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PostRequest = {}): Promise<T> {
    try {
      const result = await superagent
        .post(`${this.apiUrl()}${path}`)
        .send(data)
        .use(logNetworkTime(this.logNetworkTimeCallback))
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.error({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
  }

  async patch<T>({
    path = null,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
  }: PatchRequest = {}): Promise<T> {
    try {
      const result = await superagent
        .patch(`${this.apiUrl()}${path}`)
        .send(data)
        .use(logNetworkTime(this.logNetworkTimeCallback))
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.error({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PATCH'`)
      throw sanitisedError
    }
  }

  async delete<T>({ path = null, headers = {}, responseType = '', raw = false }: DeleteRequest = {}): Promise<T> {
    try {
      const result = await superagent
        .delete(`${this.apiUrl()}${path}`)
        .use(logNetworkTime(this.logNetworkTimeCallback))
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.error({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
      throw sanitisedError
    }
  }
}
