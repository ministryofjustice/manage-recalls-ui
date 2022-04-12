import { NextFunction } from 'express'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'
import { createRecall } from './createRecall'
import { createRecall as createRecallApi, getPrisonerByNomsNumber } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')

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

    const req = mockReq({ method: 'POST', body: { nomsNumber } })
    const res = mockRes()

    await createRecall(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/pre-cons-name`)
  })

  it('redirects to licence name if the person does have a middle name', async () => {
    const recallId = '123'
    ;(getPrisonerByNomsNumber as jest.Mock).mockResolvedValue({ ...person, middleNames: 'Bryan' })
    ;(createRecallApi as jest.Mock).mockResolvedValue({ recallId })

    const req = mockReq({ method: 'POST', body: { nomsNumber } })
    const res = mockRes()

    await createRecall(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/licence-name`)
  })

  it('calls next if createRecall fails', async () => {
    ;(getPrisonerByNomsNumber as jest.Mock).mockResolvedValue({ ...person, middleNames: 'Bryan' })
    const err = new Error('Timeout')
    ;(createRecallApi as jest.Mock).mockRejectedValue(err)
    next = jest.fn()

    const req = mockReq({ method: 'POST', body: { nomsNumber } })
    const res = mockRes()

    await createRecall(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
