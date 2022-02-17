import superagent from 'superagent'
import { manageRecallsApiConfig } from '../config'
import RestClient from '../data/restClient'
import { RecallResponse as Recall } from '../@types/manage-recalls-api/models/RecallResponse'
import { NewDocumentResponse } from '../@types/manage-recalls-api/models/NewDocumentResponse'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { LocalDeliveryUnitResponse } from '../@types/manage-recalls-api/models/LocalDeliveryUnitResponse'
import { Prisoner } from '../@types/manage-recalls-api/models/Prisoner'
import { ObjectMap } from '../@types'
import {
  Court,
  GetDocumentResponse,
  UpdateRecallRequest,
  UserDetailsResponse,
  Prison,
  RecallDocument,
  BookRecallRequest,
  AddUserDetailsRequest,
  CreateLastKnownAddressRequest,
} from '../@types/manage-recalls-api'
import { MissingDocumentsRecordRequest } from '../@types/manage-recalls-api/models/MissingDocumentsRecordRequest'
import { PoliceForce } from '../@types/manage-recalls-api/models/PoliceForce'
import { GenerateDocumentRequest } from '../@types/manage-recalls-api/models/GenerateDocumentRequest'
import { FieldAuditEntry } from '../@types/manage-recalls-api/models/FieldAuditEntry'
import { FieldAuditSummary } from '../@types/manage-recalls-api/models/FieldAuditSummary'
import { RecallReasonResponse } from '../@types/manage-recalls-api/models/RecallReasonResponse'
import { MappaLevelResponse } from '../@types/manage-recalls-api/models/MappaLevelResponse'
import { RecallResponseLite } from '../@types/manage-recalls-api/models/RecallResponseLite'
import { RescindRequestRequest } from '../@types/manage-recalls-api/models/RescindRequestRequest'
import { RescindDecisionRequest } from '../@types/manage-recalls-api/models/RescindDecisionRequest'
import { ReturnToCustodyDatesRequest } from '../@types/manage-recalls-api/models/ReturnToCustodyDatesRequest'

export async function getPrisonerByNomsNumber(nomsNumber: string, token: string): Promise<Prisoner | null> {
  return restClient(token).get<Prisoner>({
    path: `/prisoner/${nomsNumber}`,
    headers: { Accept: 'application/json' },
  })
}

export async function getRecallList(token: string): Promise<RecallResponseLite[]> {
  return restClient(token).get<RecallResponseLite[]>({ path: '/recalls' })
}

export async function searchRecalls(searchParams: ObjectMap<string>, token: string): Promise<Recall[]> {
  return restClient(token).post<Recall[]>({ path: '/recalls/search', data: searchParams })
}

export function generateRecallDocument(
  recallId: string,
  document: GenerateDocumentRequest,
  token: string
): Promise<NewDocumentResponse> {
  return restClient(token).post<NewDocumentResponse>({
    path: `/recalls/${recallId}/documents/generated`,
    data: document,
  })
}

// downloads document metadata and the file contents
export function getDocumentWithContents(
  { recallId, documentId }: { recallId: string; documentId: string },
  token: string
): Promise<GetDocumentResponse> {
  return restClient(token).get<GetDocumentResponse>({ path: `/recalls/${recallId}/documents/${documentId}` })
}

export function getDocumentCategoryHistory(
  recallId: string,
  category: RecallDocument.category,
  token: string
): Promise<RecallDocument[]> {
  return restClient(token).get<RecallDocument[]>({ path: `/recalls/${recallId}/documents?category=${category}` })
}

export function getSingleFieldHistory(recallId: string, fieldId: string, token: string): Promise<FieldAuditEntry[]> {
  return restClient(token).get<FieldAuditEntry[]>({ path: `/audit/${recallId}/${fieldId}` })
}

export function getAllFieldsHistory(recallId: string, token: string): Promise<FieldAuditSummary[]> {
  return restClient(token).get<FieldAuditSummary[]>({ path: `/audit/${recallId}` })
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

export function uploadRecallDocument(
  recallId: string,
  document: UploadDocumentRequest,
  token: string
): Promise<NewDocumentResponse> {
  return restClient(token).post<NewDocumentResponse>({
    path: `/recalls/${recallId}/documents/uploaded`,
    data: document,
  })
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
): Promise<NewDocumentResponse> {
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

export function addRescindRecord(
  recallId: string,
  data: RescindRequestRequest,
  token: string
): Promise<superagent.Response> {
  return restClient(token).post<superagent.Response>({ path: `/recalls/${recallId}/rescind-records`, data, raw: true })
}

export function addReturnToCustodyDates(
  recallId: string,
  data: ReturnToCustodyDatesRequest,
  token: string
): Promise<superagent.Response> {
  return restClient(token).post<superagent.Response>({
    path: `/recalls/${recallId}/returned-to-custody`,
    data,
    raw: true,
  })
}

export function updateRescindRecord(
  recallId: string,
  rescindRecordId: string,
  data: RescindDecisionRequest,
  token: string
): Promise<superagent.Response> {
  return restClient(token).patch<superagent.Response>({
    path: `/recalls/${recallId}/rescind-records/${rescindRecordId}`,
    data,
    raw: true,
  })
}

export function addLastKnownAddress(address: CreateLastKnownAddressRequest, token: string) {
  return restClient(token).post({
    path: '/last-known-addresses',
    data: address,
    raw: true,
  })
}

export function deleteLastKnownAddress(recallId: string, lastKnownAddressId: string, token: string) {
  return restClient(token).delete({
    path: `/recalls/${recallId}/last-known-addresses/${lastKnownAddressId}`,
    raw: true,
  })
}

export function addUserDetails(data: AddUserDetailsRequest, token: string): Promise<UserDetailsResponse> {
  return restClient(token).post<UserDetailsResponse>({ path: '/users', data })
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

export function getReasonsForRecall(): Promise<RecallReasonResponse[]> {
  return restClient().get<RecallReasonResponse[]>({ path: '/reference-data/recall-reasons' })
}

export function getMappaLevels(): Promise<MappaLevelResponse[]> {
  return restClient().get<MappaLevelResponse[]>({ path: '/reference-data/mappa-levels' })
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
