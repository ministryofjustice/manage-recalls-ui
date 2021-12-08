import { RecallResponse } from '../../../@types/manage-recalls-api'

interface UserNames {
  assessedByUserName?: string
  bookedByUserName?: string
  dossierCreatedByUserName?: string
}

export const getUserNames = async (recall: RecallResponse): Promise<UserNames> => {
  const { assessedByUserName, bookedByUserName, dossierCreatedByUserName } = recall
  const result = {} as UserNames
  result.assessedByUserName = assessedByUserName || undefined
  result.bookedByUserName = bookedByUserName || undefined
  result.dossierCreatedByUserName = dossierCreatedByUserName || undefined
  return result
}
