import { PersonSearchResult } from '../../../@types'
import { searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getRedisAsync, getRedisClient } from '../../../clients/redis'
import logger from '../../../../logger'
import config from '../../../config'

const getKey = (nomsNumber: string) => `person:${nomsNumber}`

const fetchPersonFromApiAndCache = async (
  nomsNumber: string,
  token: string,
  useCache?: boolean
): Promise<PersonSearchResult | null> =>
  searchByNomsNumber(nomsNumber, token).then(person => {
    if (person && useCache) {
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
  enableCache?: boolean
): Promise<PersonSearchResult | null> => {
  const useCache = enableCache || (process.env.ENVIRONMENT !== 'PRODUCTION' && process.env.NODE_ENV !== 'test')
  if (useCache) {
    const stored = await getRedisAsync(getKey(nomsNumber))
    if (stored) {
      fetchPersonFromApiAndCache(nomsNumber, token, useCache)
      logger.info(`Redis cache hit for ${nomsNumber}`)
      try {
        const person = JSON.parse(stored)
        return person
      } catch (err) {
        logger.error(err)
      }
    }
  }
  return fetchPersonFromApiAndCache(nomsNumber, token, useCache)
}
