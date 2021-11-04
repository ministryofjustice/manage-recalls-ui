import redis from 'redis'
import { promisify } from 'util'
import config from '../config'

export const redisClient = redis.createClient({
  port: config.redis.port,
  password: config.redis.password,
  host: config.redis.host,
  tls: config.redis.tls_enabled === 'true' ? {} : false,
})

export const getRedisAsync = promisify(redisClient.get).bind(redisClient)
