import { getAddressByUprn, getAddressesByPostcode } from './osPlacesApiClient'
import RestClient, { GetRequest } from '../data/restClient'
import config from '../config'

jest.mock('../data/restClient')

const fakeGet = jest.fn()

class FakeClient {
  async get(arg: GetRequest) {
    return fakeGet(arg)
  }
}

describe('getAddressesByPostcode', () => {
  it('returns formatted addresses if the API responds with addresses', async () => {
    ;(RestClient as jest.Mock).mockReturnValue(new FakeClient())
    fakeGet.mockResolvedValue({
      results: [
        {
          DPA: {
            ORGANISATION_NAME: 'SUBWAY',
            BUILDING_NUMBER: '109',
            THOROUGHFARE_NAME: 'SHIRLEY HIGH STREET',
            POST_TOWN: 'SOUTHAMPTON',
            POSTCODE: 'SO16 4EY',
          },
        },
        {
          DPA: {
            BUILDING_NAME: 'THE WILLOWS',
            THOROUGHFARE_NAME: 'LYNN ROAD',
            POST_TOWN: 'WISBECH',
            POSTCODE: 'PE14 7DF',
          },
        },
        {
          DPA: {
            ORGANISATION_NAME: 'COLNE AVENUE BAPTIST CHURCH',
            THOROUGHFARE_NAME: 'COLNE AVENUE',
            POST_TOWN: 'SOUTHAMPTON',
            POSTCODE: 'SO16 9NY',
          },
        },
      ],
    })
    const postcode = 'E15 1JZ'
    const addresses = await getAddressesByPostcode(postcode)
    expect(fakeGet).toHaveBeenCalledWith({
      path: '/postcode',
      query: { postcode, key: config.apis.osPlacesApi.apiClientKey },
    })
    expect(addresses).toEqual([
      {
        line1: 'SUBWAY, 109, SHIRLEY HIGH STREET',
        postcode: 'SO16 4EY',
        town: 'SOUTHAMPTON',
      },
      {
        line1: 'THE WILLOWS, LYNN ROAD',
        postcode: 'PE14 7DF',
        town: 'WISBECH',
      },
      {
        line1: 'COLNE AVENUE BAPTIST CHURCH, COLNE AVENUE',
        postcode: 'SO16 9NY',
        town: 'SOUTHAMPTON',
      },
    ])
  })

  it('throws if the API call fails', async () => {
    ;(RestClient as jest.Mock).mockReturnValue(new FakeClient())
    fakeGet.mockRejectedValue(new Error('error'))
    try {
      await getAddressesByPostcode('E15 1JZ')
    } catch (e) {
      expect(e.message).toEqual('error')
    }
  })
})

describe('getAddressByUprn', () => {
  it('returns a formatted address if the API responds with an address', async () => {
    ;(RestClient as jest.Mock).mockReturnValue(new FakeClient())
    fakeGet.mockResolvedValue({
      results: [
        {
          DPA: {
            ORGANISATION_NAME: 'SUBWAY',
            BUILDING_NUMBER: '109',
            THOROUGHFARE_NAME: 'SHIRLEY HIGH STREET',
            POST_TOWN: 'SOUTHAMPTON',
            POSTCODE: 'SO16 4EY',
          },
        },
      ],
    })
    const uprn = '10000054643'
    const address = await getAddressByUprn(uprn)
    expect(fakeGet).toHaveBeenCalledWith({
      path: '/uprn',
      query: { uprn, key: config.apis.osPlacesApi.apiClientKey },
    })
    expect(address).toEqual({
      line1: 'SUBWAY, 109, SHIRLEY HIGH STREET',
      postcode: 'SO16 4EY',
      town: 'SOUTHAMPTON',
    })
  })

  it('throws if the API call fails', async () => {
    ;(RestClient as jest.Mock).mockReturnValue(new FakeClient())
    fakeGet.mockRejectedValue(new Error('error'))
    try {
      await getAddressByUprn('123')
    } catch (e) {
      expect(e.message).toEqual('error')
    }
  })
})
