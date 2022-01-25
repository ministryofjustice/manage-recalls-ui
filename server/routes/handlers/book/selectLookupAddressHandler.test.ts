import { selectLookupAddressHandler } from './selectLookupAddressHandler'
import { getAddressByUprn } from '../../../clients/osPlacesApiClient'
import { mockReq, mockRes } from '../../testutils/mockRequestUtils'
import { addLastKnownAddress } from '../../../clients/manageRecallsApiClient'

jest.mock('../../../clients/osPlacesApiClient')
jest.mock('../../../clients/manageRecallsApiClient')

describe('selectLookupAddressHandler', () => {
  afterEach(() => jest.resetAllMocks())

  it('redirects to the next page if addressUprn is submitted', async () => {
    const addressUprn = '12345'
    const postcode = 'SW1A 1AA'
    const req = mockReq({ body: { addressUprn, postcode } })
    const res = mockRes({ locals: { urlInfo: { basePath: '/recalls/' } } })
    ;(getAddressByUprn as jest.Mock).mockResolvedValue({
      line1: 'COLNE AVENUE BAPTIST CHURCH, COLNE AVENUE',
      postcode: 'SO16 9NY',
      town: 'SOUTHAMPTON',
    })
    await selectLookupAddressHandler(req, res)
    // check address was saved to API

    expect(res.redirect).toHaveBeenCalledWith(303, '/recalls/request-received')
  })

  it('creates an error and redirects if no addressUprn is submitted', async () => {
    const postcode = 'SW1A 1AA'
    const req = mockReq({ body: { postcode }, originalUrl: '/address' }) // no addressUprn in body
    const res = mockRes()
    await selectLookupAddressHandler(req, res)
    expect(getAddressByUprn).not.toHaveBeenCalled()
    expect(req.session.errors).toEqual([
      {
        href: '#addressUprn',
        name: 'addressUprn',
        text: 'Select an address',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, '/address?postcode=SW1A 1AA')
  })

  it('creates an error and redirects if the places API call fails', async () => {
    const addressUprn = '12345'
    const postcode = 'SW1A 1AA'
    const req = mockReq({ body: { addressUprn, postcode }, originalUrl: '/address' })
    const res = mockRes()
    ;(getAddressByUprn as jest.Mock).mockRejectedValue(new Error('API call failed'))
    await selectLookupAddressHandler(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/address?postcode=SW1A 1AA')
  })

  it('creates an error and redirects if the save address API call fails', async () => {
    const addressUprn = '12345'
    const postcode = 'SW1A 1AA'
    const req = mockReq({ body: { addressUprn, postcode }, originalUrl: '/address' })
    const res = mockRes()
    ;(addLastKnownAddress as jest.Mock).mockRejectedValue(new Error('API call failed'))
    ;(getAddressByUprn as jest.Mock).mockResolvedValue({
      line1: 'COLNE AVENUE BAPTIST CHURCH, COLNE AVENUE',
      postcode: 'SO16 9NY',
      town: 'SOUTHAMPTON',
    })
    await selectLookupAddressHandler(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/address?postcode=SW1A 1AA')
  })
})
