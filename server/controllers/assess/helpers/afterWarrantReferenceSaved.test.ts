import { afterWarrantReferenceSaved } from './afterWarrantReferenceSaved'
import { unassignUserFromRecall } from '../../../clients/manageRecallsApiClient'
import { mockReq, mockRes } from '../../testUtils/mockRequestUtils'

jest.mock('../../../clients/manageRecallsApiClient')

describe('afterWarrantReferenceSaved', () => {
  const recallId = '123'
  const uuid = '000'
  const next = jest.fn()

  it('unassigns the user', async () => {
    const req = mockReq({ params: { recallId } })
    const res = mockRes({ locals: { user: { uuid } } })
    await afterWarrantReferenceSaved(req, res, next)
    expect(unassignUserFromRecall).toHaveBeenCalledWith(recallId, uuid, 'token')
  })

  it('sets a confirmation message on the session', async () => {
    const req = mockReq({ params: { recallId } })
    const res = mockRes({ locals: { user: { uuid } } })
    await afterWarrantReferenceSaved(req, res, next)
    expect(req.session.confirmationMessage).toEqual({
      text: 'Warrant reference number has been added.',
      link: {
        text: 'View',
        href: '#custody',
      },
      type: 'success',
    })
  })
})
