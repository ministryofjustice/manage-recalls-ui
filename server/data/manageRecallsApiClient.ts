import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'

export interface PrisonerSearchResult {
  firstName: string
  lastName: string
  nomisNumber?: string
  dateOfBirth?: string
}

export default class ManageRecallsApiClient {
  private restClient(token: string): RestClient {
    return new RestClient('Manage Recalls API Client', config.apis.manageRecallsApi, token)
  }

  searchForPrisoner(nomisNumber: string, token: string): Promise<PrisonerSearchResult[]> {
    logger.info(`Search prisoners from Manage Recalls API`)
    const request = { nomisNumber }
    return this.restClient(token).post({ path: '/search', data: request }) as Promise<PrisonerSearchResult[]>
  }
}
