import { ApiRecallDocument } from './ApiRecallDocument'

export type MissingDocumentsRecordResponse = {
  missingDocumentsRecordId: string
  emailId: string
  emailFileName: string
  categories: ApiRecallDocument.category[]
  detail: string
  version: number
  createdByUserId: string
  createdDateTime: string
}