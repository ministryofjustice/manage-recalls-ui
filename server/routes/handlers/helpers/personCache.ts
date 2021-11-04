import { PersonSearchResult } from '../../../@types'
import { searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getRedisAsync, redisClient } from '../../../clients/redis'
import logger from '../../../../logger'
import config from '../../../config'

const fetchPersonFromApiAndCache = async (nomsNumber: string, token: string): Promise<PersonSearchResult | null> =>
  searchByNomsNumber(nomsNumber, token).then(person => {
    if (person) {
      redisClient.set(nomsNumber, JSON.stringify(person))
      redisClient.expire(nomsNumber, config.personCache.ttl)
    }
    return person
  })

export const getPerson = async (
  nomsNumber: string,
  token: string,
  isProduction?: boolean
): Promise<PersonSearchResult | null> => {
  if (!isProduction) {
    const stored = await getRedisAsync(nomsNumber)
    if (stored) {
      fetchPersonFromApiAndCache(nomsNumber, token)
      logger.info(`Redis cache hit for ${nomsNumber}`)
      return JSON.parse(stored)
    }
    logger.info(`Redis cache miss for ${nomsNumber}`)
  }
  return fetchPersonFromApiAndCache(nomsNumber, token)
}
