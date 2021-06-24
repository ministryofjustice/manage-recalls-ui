import config from '../../config'
import RestClient from '../../data/restClient'

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomsNumber?: string
  dateOfBirth?: string
}

export function searchByNomsNumber(nomsNumber: string, token: string): Promise<PrisonerSearchResult[]> {
  const request = { nomsNumber }
  return restClient(token).post({ path: '/search', data: request }) as Promise<PrisonerSearchResult[]>
}

export function generateRevocationOrder(token: string): Promise<PrisonerSearchResult[]> {
  const request = {}
  return restClient(token).post({ path: '/generate-revocation-order', data: request }) as Promise<
    PrisonerSearchResult[]
  >
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', config.apis.manageRecallsApi, token)
}
