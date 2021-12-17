import { getPerson } from '../personCache'
import { getRecall } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { SearchResult } from '../../../../@types/manage-recalls-api/models/SearchResult'

export const getPersonAndRecall = async ({
  recallId,
  nomsNumber,
  token,
}: {
  recallId: string
  nomsNumber: string
  token: string
}): Promise<{ person: SearchResult; recall: RecallResponse }> => {
  const [personResult, recallResult] = await Promise.allSettled([
    getPerson(nomsNumber as string, token),
    getRecall(recallId, token),
  ])
  if (personResult.status === 'rejected') {
    throw new Error('getPerson failed')
  }
  const person = personResult.value
  if (recallResult.status === 'rejected') {
    throw new Error(`getRecall failed for ID ${recallId}`)
  }
  const recall = recallResult.value

  return { person, recall }
}
