import config from '../../config'
import RestClient from '../../data/restClient'

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}

export interface Pdf {
  content: string
}

export interface RecallUniqueIdentifier {
  uuid: string
}

export function searchByNomsNumber(nomsNumber: string, token: string): Promise<PrisonerSearchResult[]> {
  const request = { nomsNumber }
  return restClient(token).post({ path: '/search', data: request }) as Promise<PrisonerSearchResult[]>
}

export function generateRevocationOrder(token: string): Promise<Pdf> {
  return restClient(token).post({ path: '/generate-revocation-order' }) as Promise<Pdf>
}

export function createRecall(nomsNumber: string, token: string): Promise<RecallUniqueIdentifier> {
  const request = { nomsNumber }
  return restClient(token).post({ path: '/create-recall', data: request }) as Promise<RecallUniqueIdentifier>
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', config.apis.manageRecallsApi, token)
}
