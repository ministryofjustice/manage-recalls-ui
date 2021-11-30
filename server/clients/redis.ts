import redis, { RedisClient } from 'redis'
import promClient from 'prom-client'
import config from '../config'
import logger from '../../logger'

let redisClient: RedisClient

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      port: config.redis.port,
      password: config.redis.password,
      host: config.redis.host,
      tls: config.redis.tls_enabled === 'true' ? {} : false,
    })
  }
  return redisClient
}

const counter = new promClient.Counter({
  name: 'redis_connection_errors',
  help: 'count of redis connection issues',
})

export const getRedisAsync = (key: string): Promise<string | null> =>
  new Promise(resolve => {
    redisClient.get(key, (err, value) => {
      if (err) {
        logger.error(err)
        counter.inc()
      }
      resolve(err ? null : value)
    })
  })
