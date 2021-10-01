import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { UploadDocumentMetadata } from '../../../@types'

export const documentTypes: UploadDocumentMetadata[] = [
  {
    label: 'Part A recall report',
    name: ApiRecallDocument.category.PART_A_RECALL_REPORT,
    type: 'document',
    required: true,
    fileName: 'Part A.pdf',
  },
  {
    label: 'Licence',
    name: ApiRecallDocument.category.LICENCE,
    type: 'document',
    required: true,
    fileName: 'Licence.pdf',
  },
  {
    label: 'Previous convictions sheet',
    name: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
    type: 'document',
    required: true,
    fileName: 'Pre Cons.pdf',
  },
  {
    label: 'Pre-sentencing report',
    name: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
    type: 'document',
    required: true,
    fileName: 'PSR.pdf',
  },
  {
    label: 'OASys Risk Assessment',
    name: ApiRecallDocument.category.OASYS_RISK_ASSESSMENT,
    type: 'document',
    fileName: 'OASys.pdf',
  },
  {
    label: 'Recall request email',
    name: ApiRecallDocument.category.RECALL_REQUEST_EMAIL,
    type: 'email',
  },
  {
    label: 'Recall notification email',
    name: ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL,
    type: 'email',
  },
  {
    label: 'Dossier email',
    name: ApiRecallDocument.category.DOSSIER_EMAIL,
    type: 'email',
  },
]
