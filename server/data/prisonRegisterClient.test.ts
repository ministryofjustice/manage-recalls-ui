import { getActivePrisonList } from './prisonRegisterClient'
import RestClient from './restClient'
import { Prison } from '../@types'

jest.mock('./restClient')

describe('getActivePrisonList', () => {
  it('returns a list of active prisons if successful', async () => {
    ;(RestClient as jest.Mock).mockImplementation(() => {
      return {
        get: async (): Promise<Prison[]> => [
          {
            prisonId: 'ALI',
            prisonName: 'Albany (HMP)',
            active: false,
          },
          {
            prisonId: 'AKI',
            prisonName: 'Acklington (HMP)',
            active: true,
          },
        ],
      }
    })
    const prisons = await getActivePrisonList()
    expect(prisons).toEqual([
      {
        prisonId: 'AKI',
        prisonName: 'Acklington (HMP)',
        active: true,
      },
    ])
  })

  it('returns undefined if no prisons are returned', async () => {
    ;(RestClient as jest.Mock).mockImplementation(() => {
      return {
        get: async (): Promise<Prison[]> => [],
      }
    })
    const prisons = await getActivePrisonList()
    expect(prisons).toBeUndefined()
  })

  it('returns undefined if the request fails', async () => {
    ;(RestClient as jest.Mock).mockImplementation(() => {
      return {
        get: async (): Promise<Prison[]> => {
          throw new Error('Timeout')
        },
      }
    })
    const prisons = await getActivePrisonList()
    expect(prisons).toBeUndefined()
  })
})