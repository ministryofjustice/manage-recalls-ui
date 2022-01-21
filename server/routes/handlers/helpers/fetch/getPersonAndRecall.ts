import { getPerson } from '../personCache'
import { getRecall } from '../../../../clients/manageRecallsApiClient'
import { PersonAndRecallResponse } from '../../../../@types'

export const getPersonAndRecall = async ({
  recallId,
  nomsNumber,
  token,
}: {
  recallId: string
  nomsNumber: string
  token: string
}): Promise<PersonAndRecallResponse> => {
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
