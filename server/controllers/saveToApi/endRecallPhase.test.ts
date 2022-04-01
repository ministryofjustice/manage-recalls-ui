import { endRecallPhase } from './endRecallPhase'
import { StartPhaseRequest } from '../../@types/manage-recalls-api/models/StartPhaseRequest'
import { updateRecall, addPhaseEndTime } from '../../clients/manageRecallsApiClient'
import { User } from '../../@types'
import { isInCustody } from '../utils/recallStatus'
import logger from '../../../logger'

jest.mock('../../clients/manageRecallsApiClient')
jest.mock('../utils/recallStatus')

const token = 'token'

describe('endRecallPhase', () => {
  const recallId = '123'
  const uuid = '456'
  const user = { uuid, token } as User

  afterEach(() => jest.resetAllMocks())

  it('should update the recall and set a phase timing', async () => {
    const phase = StartPhaseRequest.phase.BOOK
    const recall = {}
    const inCustody = false
    ;(updateRecall as jest.Mock).mockResolvedValue(recall)
    ;(isInCustody as jest.Mock).mockReturnValue(inCustody)
    ;(addPhaseEndTime as jest.Mock).mockResolvedValue({ status: 200 })
    await endRecallPhase(phase)({
      recallId,
      valuesToSave: { bookedByUserId: user.uuid },
      user,
    })
    expect(updateRecall).toHaveBeenCalledWith(recallId, { bookedByUserId: user.uuid }, token)
    expect(addPhaseEndTime).toHaveBeenCalledWith({ recallId, user, valuesToSave: { phase, shouldUnassign: inCustody } })
  })

  it('should set unassign to true if person is in custody', async () => {
    const phase = StartPhaseRequest.phase.DOSSIER
    const recall = {}
    const inCustody = true
    ;(updateRecall as jest.Mock).mockResolvedValue(recall)
    ;(isInCustody as jest.Mock).mockReturnValue(inCustody)
    ;(addPhaseEndTime as jest.Mock).mockResolvedValue({ status: 200 })
    await endRecallPhase(phase)({
      recallId,
      valuesToSave: { phase: StartPhaseRequest.phase.ASSESS },
      user,
    })
    expect(addPhaseEndTime).toHaveBeenCalledWith({ recallId, user, valuesToSave: { phase, shouldUnassign: inCustody } })
  })

  it('should log if adding a timing fails', async () => {
    ;(addPhaseEndTime as jest.Mock).mockRejectedValue(new Error('test'))
    ;(updateRecall as jest.Mock).mockResolvedValue({ status: 200 })
    jest.spyOn(logger, 'error')
    await endRecallPhase(StartPhaseRequest.phase.ASSESS)({
      recallId,
      valuesToSave: { phase: StartPhaseRequest.phase.ASSESS },
      user,
    })
    expect(logger.error).toHaveBeenCalledWith(
      'Error updating recall or adding end ASSESS phase timing for recall 123: test'
    )
  })
})
