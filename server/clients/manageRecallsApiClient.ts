import superagent from 'superagent'
import { manageRecallsApiConfig } from '../config'
import RestClient from './restClient'
import { RecallResponse as Recall } from '../@types/manage-recalls-api/models/RecallResponse'
import { NewDocumentResponse } from '../@types/manage-recalls-api/models/NewDocumentResponse'
import { UploadDocumentRequest } from '../@types/manage-recalls-api/models/UploadDocumentRequest'
import { LocalDeliveryUnitResponse } from '../@types/manage-recalls-api/models/LocalDeliveryUnitResponse'
import { Prisoner } from '../@types/manage-recalls-api/models/Prisoner'
import { ObjectMap, SaveToApiFnArgs, User } from '../@types'
import {
  Court,
  GetDocumentResponse,
  UpdateRecallRequest,
  UserDetailsResponse,
  Prison,
  RecallDocument,
  BookRecallRequest,
  AddUserDetailsRequest,
  GetReportResponse,
} from '../@types/manage-recalls-api'
import { MissingDocumentsRecordRequest } from '../@types/manage-recalls-api/models/MissingDocumentsRecordRequest'
import { PoliceForce } from '../@types/manage-recalls-api/models/PoliceForce'
import { GenerateDocumentRequest } from '../@types/manage-recalls-api/models/GenerateDocumentRequest'
import { FieldAuditEntry } from '../@types/manage-recalls-api/models/FieldAuditEntry'
import { FieldAuditSummary } from '../@types/manage-recalls-api/models/FieldAuditSummary'
import { RecallReasonResponse } from '../@types/manage-recalls-api/models/RecallReasonResponse'
import { MappaLevelResponse } from '../@types/manage-recalls-api/models/MappaLevelResponse'
import { RecallResponseLite } from '../@types/manage-recalls-api/models/RecallResponseLite'
import { StopReasonResponse } from '../@types/manage-recalls-api/models/StopReasonResponse'
import { StatisticsSummary } from '../@types/manage-recalls-api/models/StatisticsSummary'

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

export function setRecommendedRecallType({
  recallId,
  valuesToSave,
  user,
}: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).patch<superagent.Response>({
    path: `/recalls/${recallId}/recommended-recall-type`,
    data: valuesToSave as Record<string, unknown>,
    raw: true,
  })
}

export function setConfirmedRecallType({
  recallId,
  valuesToSave,
  user,
}: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).patch<superagent.Response>({
    path: `/recalls/${recallId}/confirmed-recall-type`,
    data: valuesToSave as Record<string, unknown>,
    raw: true,
  })
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

export function addNote({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post<superagent.Response>({
    path: `/recalls/${recallId}/notes`,
    data: valuesToSave as Record<string, unknown>,
    raw: true,
  })
}

export function addMissingDocumentRecord(
  recallId: string,
  data: MissingDocumentsRecordRequest,
  user: User
): Promise<superagent.Response> {
  return restClient(user.token).post<superagent.Response>({
    path: `/recalls/${recallId}/missing-documents-records`,
    data,
    raw: true,
  })
}

export function addPartbRecord({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post<superagent.Response>({
    path: `/recalls/${recallId}/partb-records`,
    data: valuesToSave as Record<string, unknown>,
    raw: true,
  })
}

export function addRescindRecord({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post<superagent.Response>({
    path: `/recalls/${recallId}/rescind-records`,
    data: {
      details: valuesToSave.details,
      emailReceivedDate: valuesToSave.emailReceivedDate,
      emailFileContent: valuesToSave.fileContent,
      emailFileName: valuesToSave.fileName,
    },
    raw: true,
  })
}

export function stopRecall({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post<superagent.Response>({
    path: `/recalls/${recallId}/stop`,
    data: valuesToSave as Record<string, unknown>,
    raw: true,
  })
}

export function addReturnToCustodyDates({
  recallId,
  valuesToSave,
  user,
}: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post<superagent.Response>({
    path: `/recalls/${recallId}/returned-to-custody`,
    data: valuesToSave as Record<string, unknown>,
    raw: true,
  })
}

export function updateRescindRecord({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  const {
    rescindRecordId,
    approved,
    details,
    emailSentDate,
    fileContent: emailFileContent,
    fileName: emailFileName,
  } = valuesToSave as Record<string, unknown>
  return restClient(user.token).patch<superagent.Response>({
    path: `/recalls/${recallId}/rescind-records/${rescindRecordId}`,
    data: {
      approved,
      details,
      emailSentDate,
      emailFileContent,
      emailFileName,
    },
    raw: true,
  })
}

export function addLastKnownAddress({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post({
    path: `/recalls/${recallId}/last-known-addresses`,
    data: valuesToSave,
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

export function getStopReasons(): Promise<StopReasonResponse[]> {
  return restClient().get<StopReasonResponse[]>({ path: '/reference-data/stop-reasons' })
}

export function assignUserToRecall(recallId: string, assignee: string, token: string): Promise<Recall> {
  return restClient(token).post<Recall>({ path: `/recalls/${recallId}/assignee/${assignee}`, data: {} })
}

export function unassignUserFromRecall(recallId: string, assignee: string, token: string): Promise<Recall> {
  return restClient(token).delete<Recall>({ path: `/recalls/${recallId}/assignee/${assignee}` })
}

export function addPhaseStartTime({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).post({ path: `/recalls/${recallId}/start-phase`, data: valuesToSave, raw: true })
}

export function addPhaseEndTime({ recallId, valuesToSave, user }: SaveToApiFnArgs): Promise<superagent.Response> {
  return restClient(user.token).patch({
    path: `/recalls/${recallId}/end-phase`,
    data: valuesToSave,
    raw: true,
  })
}

export function getServiceMetrics(token: string): Promise<StatisticsSummary> {
  return restClient(token).get<StatisticsSummary>({ path: '/statistics/summary' })
}

export function getWeeklyRecallsNew(token: string): Promise<GetReportResponse> {
  return restClient(token).get<GetReportResponse>({ path: '/reports/weekly-recalls-new' })
}

function restClient(token?: string): RestClient {
  return new RestClient('Manage Recalls API Client', manageRecallsApiConfig(), token)
}
