import config from '../../config'
import RestClient from '../../data/restClient'
import { RecallResponse as Recall, Pdf } from '../../@types/manage-recalls-api'

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}

export async function searchByNomsNumber(nomsNumber: string, token: string): Promise<PrisonerSearchResult | null> {
  const request = { nomsNumber }
  const results = await restClient(token).post<PrisonerSearchResult[]>({ path: '/search', data: request })
  if (results && results.length) {
    return results[0]
  }
  return null
}

export async function getRecallList(token: string): Promise<Recall[]> {
  return restClient(token).get<Recall[]>({ path: '/recalls' })
}

export function generateRevocationOrder(token: string): Promise<Pdf> {
  return restClient(token).post<Pdf>({ path: '/generate-revocation-order' })
}

export function createRecall(nomsNumber: string, token: string): Promise<Recall> {
  const request = { nomsNumber }
  return restClient(token).post<Recall>({ path: '/recalls', data: request })
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', config.apis.manageRecallsApi, token)
}
