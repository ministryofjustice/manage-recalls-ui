import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { UploadDocumentMetadata } from '../../../@types'

export const documentTypes: UploadDocumentMetadata[] = [
  {
    label: 'Invalid',
    name: ApiRecallDocument.category.invalid,
  },
  {
    label: 'Part A recall report',
    name: ApiRecallDocument.category.PART_A_RECALL_REPORT,
  },
  {
    label: 'OASys Risk Assessment',
    name: ApiRecallDocument.category.OASYS_RISK_ASSESSMENT,
  },
  { label: 'Licence', name: ApiRecallDocument.category.LICENCE },
  {
    label: 'Previous convictions sheet',
    name: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
  },
  {
    label: 'Pre-sentencing report',
    name: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
  },
]
