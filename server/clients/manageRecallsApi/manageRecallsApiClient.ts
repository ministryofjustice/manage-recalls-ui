import { manageRecallsApiConfig } from '../../config'
import RestClient from '../../data/restClient'
import { RecallResponse as Recall } from '../../@types/manage-recalls-api/models/RecallResponse'
import { AddDocumentResponse } from '../../@types/manage-recalls-api/models/AddDocumentResponse'
import { AddDocumentRequest } from '../../@types/manage-recalls-api/models/AddDocumentRequest'
import { Pdf } from '../../@types/manage-recalls-api/models/Pdf'
import { PrisonerSearchResult } from '../../@types'
import { GetDocumentResponse } from '../../@types/manage-recalls-api'
import { ObjectStrings } from '../../@types/express'

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

export function updateRecall(recallId: string, updatedFields: ObjectStrings, token: string): Promise<Recall> {
  return restClient(token).patch<Recall>({ path: `/recalls/${recallId}`, data: updatedFields })
}

export function getRecallDocument(recallId: string, documentId: string, token: string): Promise<GetDocumentResponse> {
  return restClient(token).get<GetDocumentResponse>({ path: `/recalls/${recallId}/documents/${documentId}` })
}

export function addRecallDocument(
  recallId: string,
  document: AddDocumentRequest,
  token: string
): Promise<AddDocumentResponse> {
  return restClient(token).post({ path: `/recalls/${recallId}/documents`, data: document })
}

function restClient(token: string): RestClient {
  return new RestClient('Manage Recalls API Client', manageRecallsApiConfig(), token)
}
