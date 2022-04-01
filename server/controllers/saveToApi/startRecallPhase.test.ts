import { Request, Response } from 'express'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'
import { startRecallPhase } from './startRecallPhase'
import { StartPhaseRequest } from '../../@types/manage-recalls-api/models/StartPhaseRequest'
import { assignUserToRecall, addPhaseStartTime } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')

const token = 'token'

describe('startRecallPhase', () => {
  const recallId = '123'
  const uuid = '456'
  const user = { uuid, token }
  let req: Request
  let res: Response

  beforeEach(() => {
    req = mockReq({ method: 'POST', params: { recallId } })
    res = mockRes({
      token,
      locals: {
        user,
        urlInfo: {
          basePath: `/recalls/${recallId}/`,
        },
      },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('should redirect to the assess recall page if calls succeed', async () => {
    const phase = StartPhaseRequest.phase.DOSSIER
    ;(assignUserToRecall as jest.Mock).mockResolvedValue({ status: 200 })
    ;(addPhaseStartTime as jest.Mock).mockResolvedValue({ status: 200 })
    await startRecallPhase({ phase, nextPageUrlSuffix: 'assess' })(req, res)
    expect(assignUserToRecall).toHaveBeenCalledWith(recallId, uuid, token)
    expect(addPhaseStartTime).toHaveBeenCalledWith({ recallId, user, valuesToSave: { phase } })
    expect(res.redirect).toHaveBeenCalledWith(303, `/recalls/${recallId}/assess`)
  })

  it('should reload the page if the assignment fails', async () => {
    ;(assignUserToRecall as jest.Mock).mockRejectedValue({ status: 500 })
    ;(addPhaseStartTime as jest.Mock).mockResolvedValue({ status: 200 })
    await startRecallPhase({ phase: StartPhaseRequest.phase.ASSESS, nextPageUrlSuffix: 'assess' })(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/')
  })

  it('should reload the page if adding a timing fails', async () => {
    ;(addPhaseStartTime as jest.Mock).mockRejectedValue({ status: 500 })
    ;(assignUserToRecall as jest.Mock).mockResolvedValue({ status: 200 })
    await startRecallPhase({ phase: StartPhaseRequest.phase.ASSESS, nextPageUrlSuffix: 'assess' })(req, res)
    expect(res.redirect).toHaveBeenCalledWith(303, '/')
  })
})
