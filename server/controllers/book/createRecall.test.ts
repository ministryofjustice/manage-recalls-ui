import { NextFunction } from 'express'
import { mockPostRequest, mockResponseWithAuthenticatedUser } from '../testUtils/mockRequestUtils'
import { createRecall } from './createRecall'
import { createRecall as createRecallApi, getPrisonerByNomsNumber } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('createRecall', () => {
  const person = {
    firstName: 'Barry',
    lastName: 'Badger',
  }
  const nomsNumber = '123ABC'
  let next: NextFunction

  it("redirects to pre cons if the person doesn't have a middle name", async () => {
    const recallId = '123'
    ;(getPrisonerByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(createRecallApi as jest.Mock).mockResolvedValue({ recallId })

    const req = mockPostRequest({ body: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/pre-cons-name`)
  })

  it('redirects to licence name if the person does have a middle name', async () => {
    const recallId = '123'
    ;(getPrisonerByNomsNumber as jest.Mock).mockResolvedValue({ ...person, middleNames: 'Bryan' })
    ;(createRecallApi as jest.Mock).mockResolvedValue({ recallId })

    const req = mockPostRequest({ body: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/licence-name`)
  })

  it('calls next if createRecall fails', async () => {
    ;(getPrisonerByNomsNumber as jest.Mock).mockResolvedValue({ ...person, middleNames: 'Bryan' })
    const err = new Error('Timeout')
    ;(createRecallApi as jest.Mock).mockRejectedValue(err)
    next = jest.fn()

    const req = mockPostRequest({ body: { nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)

    await createRecall(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
