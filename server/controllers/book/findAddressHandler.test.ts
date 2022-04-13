import { findAddressHandler } from './findAddressHandler'
import { getAddressesByPostcode } from '../../clients/osPlacesApiClient'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'

jest.mock('../../clients/osPlacesApiClient')

describe('findAddressHandler', () => {
  const postcode = 'PE147df'

  it('adds postcode and addresses to res.locals and calls next', async () => {
    ;(getAddressesByPostcode as jest.Mock).mockResolvedValue([
      {
        address: 'SUBWAY, 109, SHIRLEY HIGH STREET, SOUTHAMPTON, SO16 4EY',
        uprn: '123',
      },
      {
        address: 'THE WILLOWS, LYNN ROAD, WISBECH, PE14 7DF',
        uprn: '456',
      },
    ])
    const req = mockReq({ query: { postcode } })
    const res = mockRes()
    const next = jest.fn()
    await findAddressHandler(req, res, next)
    // reformatted postcode is used
    expect(res.locals.postcode).toEqual('PE14 7DF')
    expect(res.locals.addresses).toEqual([
      {
        text: 'SUBWAY, 109, SHIRLEY HIGH STREET, SOUTHAMPTON, SO16 4EY',
        value: '123',
      },
      {
        text: 'THE WILLOWS, LYNN ROAD, WISBECH, PE14 7DF',
        value: '456',
      },
    ])
    expect(next).toHaveBeenCalled()
  })

  it('creates an error and redirects if no postcode is submitted', async () => {
    const req = mockReq() // no postcode on query string
    const res = mockRes({ locals: { urlInfo: { basePath: '/recalls/' } } })
    const next = jest.fn()
    await findAddressHandler(req, res, next)
    expect(getAddressesByPostcode).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        href: '#postcode',
        name: 'postcode',
        text: 'Enter a postcode',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, '/recalls/postcode-lookup')
  })

  it('creates an error and redirects if the API call fails', async () => {
    const req = mockReq({ query: { postcode } })
    const res = mockRes({ locals: { urlInfo: { basePath: '/recalls/' } } })
    const next = jest.fn()
    ;(getAddressesByPostcode as jest.Mock).mockRejectedValue(new Error('API call failed'))
    await findAddressHandler(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, '/recalls/postcode-lookup')
  })

  it('creates an error if the API returns no results', async () => {
    const req = mockReq({ query: { postcode } })
    const res = mockRes({ locals: { urlInfo: { basePath: '/recalls/' } } })
    const next = jest.fn()
    ;(getAddressesByPostcode as jest.Mock).mockResolvedValue([])
    await findAddressHandler(req, res, next)
    expect(req.session.errors).toEqual([
      {
        href: '#postcode',
        name: 'postcode',
        text: 'No matching post code found',
      },
    ])
    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(303, '/recalls/postcode-lookup')
  })
})
