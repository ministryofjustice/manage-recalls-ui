import { SearchResult } from '../../../@types/manage-recalls-api/models/SearchResult'
import { prisonerByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getRedisAsync, getRedisClient } from '../../../clients/redis'
import logger from '../../../../logger'
import config from '../../../config'

const getKey = (nomsNumber: string) => `person:${nomsNumber}`

const fetchPersonFromApiAndCache = async (
  nomsNumber: string,
  token: string,
  useCache?: boolean
): Promise<SearchResult | undefined> =>
  prisonerByNomsNumber(nomsNumber, token).then(person => {
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
): Promise<SearchResult | null> => {
  const useCache = enableCache || (process.env.ENVIRONMENT !== 'PRODUCTION' && process.env.NODE_ENV !== 'test')
  if (useCache) {
    const stored = await getRedisAsync(getKey(nomsNumber))
    if (stored) {
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
