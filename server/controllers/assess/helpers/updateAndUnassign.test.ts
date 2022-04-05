import { updateAndUnassign } from './updateAndUnassign'
import { updateRecall, unassignUserFromRecall } from '../../../clients/manageRecallsApiClient'
import { User } from '../../../@types'

jest.mock('../../../clients/manageRecallsApiClient')

describe('updateAndUnassign', () => {
  const recallId = '123'
  const uuid = '000'

  it('updates the recall and unassigns the user', async () => {
    const valuesToSave = {}
    const user = { token: 'token', uuid } as User
    await updateAndUnassign({ recallId, valuesToSave, user })
    expect(updateRecall).toHaveBeenCalledWith(recallId, valuesToSave, 'token')
    expect(unassignUserFromRecall).toHaveBeenCalledWith(recallId, uuid, 'token')
  })
})
