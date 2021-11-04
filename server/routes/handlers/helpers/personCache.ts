import { PersonSearchResult } from '../../../@types'
import { searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getRedisAsync, getRedisClient } from '../../../clients/redis'
import logger from '../../../../logger'
import config from '../../../config'

const getKey = (nomsNumber: string) => `person:${nomsNumber}`

const fetchPersonFromApiAndCache = async (
  nomsNumber: string,
  token: string,
  isProduction?: boolean
): Promise<PersonSearchResult | null> =>
  searchByNomsNumber(nomsNumber, token).then(person => {
    if (person && !isProduction) {
      try {
        const redisClient = getRedisClient()
        redisClient.set(getKey(nomsNumber), JSON.stringify(person))
        redisClient.expire(getKey(nomsNumber), config.personCache.ttl)
      } catch (err) {
        logger.error(err)
      }
    }
    return person
  })

export const getPerson = async (
  nomsNumber: string,
  token: string,
  isProduction?: boolean
): Promise<PersonSearchResult | null> => {
  if (!isProduction) {
    const stored = await getRedisAsync(getKey(nomsNumber))
    if (stored) {
      fetchPersonFromApiAndCache(nomsNumber, token, isProduction)
      logger.info(`Redis cache hit for ${nomsNumber}`)
      return JSON.parse(stored)
    }
    logger.info(`Redis cache miss for ${nomsNumber}`)
  }
  return fetchPersonFromApiAndCache(nomsNumber, token, isProduction)
}
