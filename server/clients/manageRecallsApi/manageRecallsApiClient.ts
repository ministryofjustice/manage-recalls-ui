import { manageRecallsApiConfig } from '../../config'
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
  const results = await restClient(token).post<PrisonerSearchResult[]>({
    path: '/search',
    headers: { Accept: 'application/json' },
    data: request,
  })
  if (results && results.length) {
    return results[0]
  }
  return null
}

export async function getRecallList(token: string): Promise<Recall[]> {
  return restClient(token).get<Recall[]>({ path: '/recalls' })
}

export function generateRevocationOrder(nomsNumber: string, token: string): Promise<Pdf> {
  const request = { nomsNumber }
  return restClient(token).post<Pdf>({ path: '/generate-revocation-order', data: request })
}

export function createRecall(nomsNumber: string, token: string): Promise<Recall> {
  const request = { nomsNumber }
  return restClient(token).post<Recall>({ path: '/recalls', data: request })
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', manageRecallsApiConfig(), token)
}
