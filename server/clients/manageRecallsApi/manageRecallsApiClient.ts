import config from '../../config'
import RestClient from '../../data/restClient'

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}

export interface Pdf {
  contents: string
}

export function searchByNomsNumber(nomsNumber: string, token: string): Promise<PrisonerSearchResult[]> {
  const request = { nomsNumber }
  return restClient(token).post({ path: '/search', data: request }) as Promise<PrisonerSearchResult[]>
}

export function generateRevocationOrder(token: string): Promise<Pdf> {
  return restClient(token).post({ path: '/generate-revocation-order' }) as Promise<Pdf>
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', config.apis.manageRecallsApi, token)
}
