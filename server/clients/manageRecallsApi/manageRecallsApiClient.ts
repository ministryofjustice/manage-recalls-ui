import { manageRecallsApiConfig } from '../../config'
import RestClient from '../../data/restClient'
import { RecallResponse as Recall } from '../../@types/manage-recalls-api/models/RecallResponse'
import { AddDocumentResponse } from '../../@types/manage-recalls-api/models/AddDocumentResponse'
import { AddDocumentRequest } from '../../@types/manage-recalls-api/models/AddDocumentRequest'
import { LocalDeliveryUnitResponse } from '../../@types/manage-recalls-api/models/LocalDeliveryUnitResponse'
import { Pdf } from '../../@types/manage-recalls-api/models/Pdf'
import { ObjectMap, PersonSearchResult } from '../../@types'
import {
  Court,
  GetDocumentResponse,
  UpdateRecallRequest,
  UserDetailsResponse,
  Prison,
} from '../../@types/manage-recalls-api'

export async function searchByNomsNumber(nomsNumber: string, token: string): Promise<PersonSearchResult | null> {
  const request = { nomsNumber }
  const results = await restClient(token).post<PersonSearchResult[]>({
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
  (recallId: string, token: string, uuid?: string): Promise<Pdf> => {
    return restClient(token).get<Pdf>({ path: `/recalls/${recallId}/recallNotification/${uuid}` })
  }

export const getGeneratedDocument =
  (pathSuffix: string) =>
  (recallId: string, token: string): Promise<Pdf> => {
    return restClient(token).get<Pdf>({ path: `/recalls/${recallId}/${pathSuffix}` })
  }

export function getStoredDocument(recallId: string, documentId: string, token: string): Promise<GetDocumentResponse> {
  return restClient(token).get<GetDocumentResponse>({ path: `/recalls/${recallId}/documents/${documentId}` })
}

export function getRecall(recallId: string, token: string): Promise<Recall> {
  return restClient(token).get<Recall>({ path: `/recalls/${recallId}` })
}

export function createRecall(nomsNumber: string, token: string): Promise<Recall> {
  const request = { nomsNumber }
  return restClient(token).post<Recall>({ path: '/recalls', data: request })
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

/*
Temporarily send the userId in the request body until it is added to the JWT token and can be retrieved by the API
 */
export function addUserDetails(
  userId: string,
  firstName: string,
  lastName: string,
  signature: string,
  email: string,
  phoneNumber: string,
  token: string
): Promise<UserDetailsResponse> {
  const request = { userId, firstName, lastName, signature, email, phoneNumber }
  return restClient(token).post<UserDetailsResponse>({ path: '/users', data: request })
}

export function getUserDetails(userId: string, token: string): Promise<UserDetailsResponse> {
  return restClient(token).get<UserDetailsResponse>({ path: `/users/${userId}` })
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

export function assignAssessingUser(recallId: string, assignee: string, token: string): Promise<Recall> {
  const request = { assignee }
  return restClient(token).post<Recall>({ path: `/recalls/${recallId}/assignee`, data: request })
}

export function deleteAssessingUser(recallId: string, assignee: string, token: string): Promise<Recall> {
  return restClient(token).delete<Recall>({ path: `/recalls/${recallId}/assignee/${assignee}` })
}

function restClient(token?: string): RestClient {
  return new RestClient('Manage Recalls API Client', manageRecallsApiConfig(), token)
}
