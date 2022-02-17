import { deleteAddressHandler } from './deleteAddressHandler'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'
import { deleteLastKnownAddress } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')

describe('deleteAddressHandler', () => {
  it('redirects to the next page if deleteAddressId is submitted', async () => {
    const lastKnownAddressId = '12345'
    const recallId = '456'
    const req = mockReq({ params: { recallId }, body: { deleteAddressId: lastKnownAddressId } })
    const res = mockRes({ locals: { urlInfo: { basePath: '/recalls/' } } })
    await deleteAddressHandler(req, res)

    expect(req.session.confirmationMessage).toEqual({
      text: 'The address has been deleted',
      type: 'success',
    })
    expect(deleteLastKnownAddress).toHaveBeenCalledWith(recallId, lastKnownAddressId, 'token')
    expect(res.redirect).toHaveBeenCalledWith(303, '/recalls/address-list')
  })
})
