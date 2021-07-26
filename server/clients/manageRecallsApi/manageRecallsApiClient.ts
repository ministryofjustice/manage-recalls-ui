import { manageRecallsApiConfig } from '../../config'
import RestClient from '../../data/restClient'
import { RecallResponse as Recall, Pdf } from '../../@types/manage-recalls-api'
import { RecallDocumentResponse } from '../../@types/manage-recalls-api/models/RecallDocumentResponse'
import { RecallDocumentId } from '../../@types/manage-recalls-api/models/RecallDocumentId'

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

export function getRevocationOrder(recallId: string, token: string): Promise<Pdf> {
  return restClient(token).get<Pdf>({ path: `/recalls/${recallId}/revocationOrder` })
}

export function getRecall(recallId: string, token: string): Promise<Recall> {
  return restClient(token).get<Recall>({ path: `/recalls/${recallId}` })
}

export function createRecall(nomsNumber: string, token: string): Promise<Recall> {
  const request = { nomsNumber }
  return restClient(token).post<Recall>({ path: '/recalls', data: request })
}

export function getRecallDocument(
  recallId: string,
  documentId: string,
  token: string
): Promise<RecallDocumentResponse> {
  return restClient(token).get<RecallDocumentResponse>({ path: `/recalls/${recallId}/documents/${documentId}` })
}

export function createRecallDocument(
  recallId: string,
  category: string,
  fileContent: string,
  token: string
): Promise<RecallDocumentId> {
  const request = { category, fileContent }
  return restClient(token).post<RecallDocumentId>({ path: `/recalls/${recallId}/documents`, data: request })
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', manageRecallsApiConfig(), token)
}
