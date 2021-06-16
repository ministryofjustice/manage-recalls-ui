import config from '../../config'
import RestClient from '../restClient'

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomisNumber?: string
  dateOfBirth?: string
}

export default function searchByNomisNumber(nomisNumber: string, token: string): Promise<PrisonerSearchResult[]> {
  const request = { nomisNumber }
  return restClient(token).post({ path: '/search', data: request }) as Promise<PrisonerSearchResult[]>
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', config.apis.manageRecallsApi, token)
}
