import superagent from 'superagent'
import { manageRecallsApiConfig } from '../../config'
import RestClient from '../../data/restClient'
import { RecallResponse as Recall } from '../../@types/manage-recalls-api/models/RecallResponse'
import { AddDocumentResponse } from '../../@types/manage-recalls-api/models/AddDocumentResponse'
import { AddDocumentRequest } from '../../@types/manage-recalls-api/models/AddDocumentRequest'
import { LocalDeliveryUnitResponse } from '../../@types/manage-recalls-api/models/LocalDeliveryUnitResponse'
import { Pdf } from '../../@types/manage-recalls-api/models/Pdf'
import { SearchResult } from '../../@types/manage-recalls-api/models/SearchResult'
import { ObjectMap } from '../../@types'
import {
  Court,
  GetDocumentResponse,
  UpdateRecallRequest,
  UserDetailsResponse,
  Prison,
  RecallDocument,
  BookRecallRequest,
} from '../../@types/manage-recalls-api'
import { MissingDocumentsRecordRequest } from '../../@types/manage-recalls-api/models/MissingDocumentsRecordRequest'
import { PoliceForce } from '../../@types/manage-recalls-api/models/PoliceForce'

export async function searchByNomsNumber(nomsNumber: string, token: string): Promise<SearchResult | null> {
  const request = { nomsNumber }
  const results = await restClient(token).post<SearchResult[]>({
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

export async function searchRecalls(searchParams: ObjectMap<string>, token: string): Promise<Recall[]> {
  return restClient(token).post<Recall[]>({ path: '/recalls/search', data: searchParams })
}

export const getRecallNotification =
  () =>
  ({ recallId }: { recallId: string }, token: string, uuid?: string): Promise<Pdf> => {
    return restClient(token).get<Pdf>({ path: `/recalls/${recallId}/recallNotification/${uuid}` })
  }

export const getGeneratedDocument =
  (pathSuffix: string) =>
  ({ recallId }: { recallId: string }, token: string): Promise<Pdf> => {
    return restClient(token).get<Pdf>({ path: `/recalls/${recallId}/${pathSuffix}` })
  }

export function getStoredDocument(
  { recallId, documentId }: { recallId: string; documentId: string },
  token: string
): Promise<GetDocumentResponse> {
  return restClient(token).get<GetDocumentResponse>({ path: `/recalls/${recallId}/documents/${documentId}` })
}

export function getRecall(recallId: string, token: string): Promise<Recall> {
  return restClient(token).get<Recall>({ path: `/recalls/${recallId}` })
}

export function createRecall(data: BookRecallRequest, token: string): Promise<Recall> {
  return restClient(token).post<Recall>({ path: '/recalls', data })
}

export function updateRecall(recallId: string, updatedFields: UpdateRecallRequest, token: string): Promise<Recall> {
  return restClient(token).patch<Recall>({ path: `/recalls/${recallId}`, data: updatedFields })
}

export function addRecallDocument(
  recallId: string,
  document: AddDocumentRequest,
  token: string
): Promise<AddDocumentResponse> {
  return restClient(token).post({ path: `/recalls/${recallId}/documents`, data: document })
}

export function deleteRecallDocument(
  recallId: string,
  documentId: string,
  token: string
): Promise<superagent.Response> {
  return restClient(token).delete({ path: `/recalls/${recallId}/documents/${documentId}`, raw: true })
}

export function setDocumentCategory(
  recallId: string,
  documentId: string,
  category: RecallDocument.category,
  token: string
): Promise<AddDocumentResponse> {
  return restClient(token).patch<RecallDocument>({
    path: `/recalls/${recallId}/documents/${documentId}`,
    data: { category },
  })
}

export function addMissingDocumentRecord(
  data: MissingDocumentsRecordRequest,
  token: string
): Promise<superagent.Response> {
  return restClient(token).post<superagent.Response>({ path: '/missing-documents-records', data, raw: true })
}

export function addUserDetails(
  firstName: string,
  lastName: string,
  signature: string,
  email: string,
  phoneNumber: string,
  token: string
): Promise<UserDetailsResponse> {
  const request = { firstName, lastName, signature, email, phoneNumber }
  return restClient(token).post<UserDetailsResponse>({ path: '/users', data: request })
}

export function getUserDetails(userId: string, token: string): Promise<UserDetailsResponse> {
  return restClient(token).get<UserDetailsResponse>({ path: `/users/${userId}` })
}

export function getCurrentUserDetails(token: string): Promise<UserDetailsResponse> {
  return restClient(token).get<UserDetailsResponse>({ path: `/users/current` })
}

export function getLocalDeliveryUnits(): Promise<LocalDeliveryUnitResponse[]> {
  return restClient().get<LocalDeliveryUnitResponse[]>({ path: '/reference-data/local-delivery-units' })
}

export function getCourts(): Promise<Court[]> {
  return restClient().get<Court[]>({ path: '/reference-data/courts' })
}

export function getPrisons(): Promise<Prison[]> {
  return restClient().get<Prison[]>({ path: '/reference-data/prisons' })
}

export function getPoliceForces(): Promise<PoliceForce[]> {
  return restClient().get<PoliceForce[]>({ path: '/reference-data/police-forces' })
}

export function assignUserToRecall(recallId: string, assignee: string, token: string): Promise<Recall> {
  return restClient(token).post<Recall>({ path: `/recalls/${recallId}/assignee/${assignee}`, data: {} })
}

export function unassignUserFromRecall(recallId: string, assignee: string, token: string): Promise<Recall> {
  return restClient(token).delete<Recall>({ path: `/recalls/${recallId}/assignee/${assignee}` })
}

function restClient(token?: string): RestClient {
  return new RestClient('Manage Recalls API Client', manageRecallsApiConfig(), token)
}
