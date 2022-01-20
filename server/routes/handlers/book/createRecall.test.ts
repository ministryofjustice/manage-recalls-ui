import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { createRecall } from './createRecall'
import { getPerson } from '../helpers/personCache'
import { createRecall as createRecallApi } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/personCache')

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('createRecall', () => {
  const person = {
    firstName: 'Barry',
    lastName: 'Badger',
  }
  const nomsNumber = '123ABC'

  it("redirects to pre cons if the person doesn't have a middle name", async () => {
    const recallId = '123'
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    ;(createRecallApi as jest.Mock).mockResolvedValue({ recallId })

    const req = mockPostRequest({ params: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name`)
  })

  it('redirects to licence name if the person does have a middle name', async () => {
    const recallId = '123'
    ;(getPerson as jest.Mock).mockResolvedValue({ ...person, middleNames: 'Bryan' })
    ;(createRecallApi as jest.Mock).mockResolvedValue({ recallId })

    const req = mockPostRequest({ params: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, `/persons/${nomsNumber}/recalls/${recallId}/licence-name`)
  })

  it("doesn't catch an error thrown if createRecall fails", async () => {
    ;(getPerson as jest.Mock).mockResolvedValue({ ...person, middleNames: 'Bryan' })
    ;(createRecallApi as jest.Mock).mockRejectedValue(new Error('Timeout'))

    const req = mockPostRequest({ params: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    try {
      await createRecall(req, res)
    } catch (err) {
      expect(res.redirect).not.toHaveBeenCalled()
      expect(err.message).toEqual('Timeout')
    }
  })
})
