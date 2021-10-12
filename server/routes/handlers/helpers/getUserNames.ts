import { getUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResponse } from '../../../@types/manage-recalls-api'

const getUserName = async (userId: string, token: string): Promise<string> => {
  try {
    const { firstName, lastName } = await getUserDetails(userId, token)
    return `${firstName} ${lastName}`
  } catch (err) {
    // What do we do if getUserDetails fails?
    return userId
  }
}

interface UserNames {
  assessedByUserName?: string
  bookedByUserName?: string
  dossierCreatedByUserName?: string
}

export const getUserNames = async (recall: RecallResponse, token: string): Promise<UserNames> => {
  const { assessedByUserId, bookedByUserId, dossierCreatedByUserId } = recall
  const [assessedByResult, bookedByResult, dossierCreatedByResult] = await Promise.allSettled([
    assessedByUserId ? getUserName(assessedByUserId, token) : undefined,
    bookedByUserId ? getUserName(bookedByUserId, token) : undefined,
    dossierCreatedByUserId ? getUserName(dossierCreatedByUserId, token) : undefined,
  ])
  const result = {} as UserNames
  if (assessedByResult && assessedByResult.status === 'fulfilled') {
    result.assessedByUserName = assessedByResult.value
  }
  if (bookedByResult && bookedByResult.status === 'fulfilled') {
    result.bookedByUserName = bookedByResult.value
  }
  if (dossierCreatedByResult && dossierCreatedByResult.status === 'fulfilled') {
    result.dossierCreatedByUserName = dossierCreatedByResult.value
  }
  return result
}
