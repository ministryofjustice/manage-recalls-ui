import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { DocumentCategoryMetadata } from '../../../@types/documents'

export const documentCategories: DocumentCategoryMetadata[] = [
  {
    label: 'Part A recall report',
    labelLowerCase: 'part A recall report',
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
    hintIfMissing: true,
    fileName: 'Pre Cons.pdf',
  },
  {
    label: 'Pre-sentencing report',
    name: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
    type: 'document',
    fileName: 'PSR.pdf',
  },
  {
    label: 'OASys Risk Assessment',
    labelLowerCase: 'OASys risk assessment',
    name: ApiRecallDocument.category.OASYS_RISK_ASSESSMENT,
    type: 'document',
    hintIfMissing: true,
    fileName: 'OASys.pdf',
  },
  {
    label: 'Charge sheet',
    name: ApiRecallDocument.category.CHARGE_SHEET,
    type: 'document',
    fileName: 'Charge sheet.pdf',
  },
  {
    label: 'CPS papers',
    labelLowerCase: 'CPS papers',
    name: ApiRecallDocument.category.CPS_PAPERS,
    type: 'document',
    fileName: 'CPS papers.pdf',
  },
  {
    label: 'Police report',
    name: ApiRecallDocument.category.POLICE_REPORT,
    type: 'document',
    fileName: 'Police report.pdf',
  },
  {
    label: 'Exclusion zone map',
    name: ApiRecallDocument.category.EXCLUSION_ZONE_MAP,
    type: 'document',
    fileName: 'Exclusion zone map.pdf',
  },
  {
    label: 'Other',
    name: ApiRecallDocument.category.OTHER,
    type: 'document',
    multiple: true,
  },
  {
    label: 'Choose a type',
    name: ApiRecallDocument.category.UNCATEGORISED,
    type: 'document',
    multiple: true,
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
