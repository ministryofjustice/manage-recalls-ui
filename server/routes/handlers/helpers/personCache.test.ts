import * as redisExports from '../../../clients/redis'
import { searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getPerson } from './personCache'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('Get person data from cache', () => {
  const token = 'token'
  beforeEach(() => {
    jest.spyOn(redisExports.redisClient, 'set').mockImplementation(() => true)
  })

  afterEach(() => jest.resetAllMocks())

  it('should return the cached person, if present', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(
      JSON.stringify({
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber: '1',
      })
    )
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    const person = await getPerson('1', token)
    expect(person).toEqual({
      firstName: 'Bobby',
      lastName: 'Badger',
      nomsNumber: '1',
    })
  })

  it('should return the API person, if cache is empty', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    const person = await getPerson('1', token)
    expect(person).toEqual({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
  })

  it('should populate the cache with the API person, if cache is empty', async () => {
    jest.spyOn(redisExports, 'getRedisAsync').mockResolvedValue(null)
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    await getPerson('1', token)
    expect(redisExports.redisClient.set).toHaveBeenCalledWith(
      'person:1',
      JSON.stringify({
        firstName: 'Bobbie',
        lastName: 'Badgers',
        nomsNumber: '1',
      })
    )
  })

  it('should not check the cache for production', async () => {
    jest.spyOn(redisExports, 'getRedisAsync')
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue({
      firstName: 'Bobbie',
      lastName: 'Badgers',
      nomsNumber: '1',
    })
    await getPerson('1', token, true)
    expect(redisExports.getRedisAsync).not.toHaveBeenCalled()
  })
})
