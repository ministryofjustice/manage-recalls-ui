import { RedisClient } from 'redis'
import * as redisExports from '../../../clients/redis'
import { prisonerByNomsNumber } from '../../../clients/manageRecallsApiClient'
import { getPerson } from './personCache'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('Get person data from cache', () => {
  const token = 'token'
  const redisSet = jest.fn()

  beforeEach(() => {
    jest.spyOn(redisExports, 'getRedisClient').mockReturnValue({ set: redisSet } as unknown as RedisClient)
  })

  afterEach(() => jest.resetAllMocks())

  it('should return the cached person, if present, and not refresh immediately from the API', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
      JSON.stringify({
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber: '1',
      })
    )
    const person = await getPerson('1', token, true)
    expect(prisonerByNomsNumber).not.toHaveBeenCalled()
    expect(person).toEqual({
      firstName: 'Bobby',
      lastName: 'Badger',
      nomsNumber: '1',
    })
  })

  it('should return the API person, if cache is empty', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    ;(prisonerByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    const person = await getPerson('1', token, true)
    expect(prisonerByNomsNumber).toHaveBeenCalledTimes(1)
    expect(person).toEqual({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
  })

  it('should populate the cache with the API person, if cache is empty', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    ;(prisonerByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    await getPerson('1', token, true)
    expect(redisSet).toHaveBeenCalledWith(
      'person:1',
      JSON.stringify({
        firstName: 'Bobbie',
        lastName: 'Badgers',
        nomsNumber: '1',
      })
    )
  })

  it('should not check the cache if param not supplied', async () => {
    jest.spyOn(redisExports, 'getRedisAsync')
    ;(prisonerByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    await getPerson('1', token)
    expect(redisExports.getRedisAsync).not.toHaveBeenCalled()
  })

  it('should throw if cache is empty and API errors', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    ;(prisonerByNomsNumber as jest.Mock).mockRejectedValue(new Error('Timeout'))
    try {
      await getPerson('1', token, true)
    } catch (err) {
      expect(err.message).toEqual('Timeout')
    }
  })
})
