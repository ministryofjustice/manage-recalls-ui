import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { DocumentCategoryMetadata } from '../../../../@types/documents'

export const documentCategories: DocumentCategoryMetadata[] = [
  {
    label: 'Part A recall report',
    labelLowerCase: 'part A recall report',
    name: ApiRecallDocument.category.PART_A_RECALL_REPORT,
    type: 'document',
    required: true,
    fileName: 'Part A.pdf',
    fileNamePatterns: ['part a'],
    versioned: true,
  },
  {
    label: 'Licence',
    name: ApiRecallDocument.category.LICENCE,
    type: 'document',
    required: true,
    fileName: 'Licence.pdf',
    fileNamePatterns: ['licence'],
    versioned: true,
  },
  {
    label: 'Previous convictions sheet',
    name: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
    type: 'document',
    hintIfMissing: true,
    fileName: 'Pre Cons.pdf',
    fileNamePatterns: ['pre cons', 'previous convictions'],
    versioned: true,
  },
  {
    label: 'Pre-sentencing report',
    name: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
    type: 'document',
    fileName: 'PSR.pdf',
    fileNamePatterns: ['psr', 'pre sentencing'],
    versioned: true,
  },
  {
    label: 'OASys Risk Assessment',
    labelLowerCase: 'OASys risk assessment',
    name: ApiRecallDocument.category.OASYS_RISK_ASSESSMENT,
    type: 'document',
    hintIfMissing: true,
    fileName: 'OASys.pdf',
    fileNamePatterns: ['oasys'],
    versioned: true,
  },
  {
    label: 'Charge sheet',
    name: ApiRecallDocument.category.CHARGE_SHEET,
    type: 'document',
    fileName: 'Charge sheet.pdf',
    fileNamePatterns: ['charge sheet'],
    versioned: true,
  },
  {
    label: 'CPS papers',
    labelLowerCase: 'CPS papers',
    name: ApiRecallDocument.category.CPS_PAPERS,
    type: 'document',
    fileName: 'CPS papers.pdf',
    fileNamePatterns: ['cps papers'],
    versioned: true,
  },
  {
    label: 'Police report',
    name: ApiRecallDocument.category.POLICE_REPORT,
    type: 'document',
    fileName: 'Police report.pdf',
    fileNamePatterns: ['police report'],
    versioned: true,
  },
  {
    label: 'Exclusion zone map',
    name: ApiRecallDocument.category.EXCLUSION_ZONE_MAP,
    type: 'document',
    fileName: 'Exclusion zone map.pdf',
    fileNamePatterns: ['exclusion map', 'exclusion zone'],
    versioned: true,
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
  {
    label: 'Revocation order',
    name: ApiRecallDocument.category.REVOCATION_ORDER,
    type: 'generated',
  },
  {
    label: 'Dossier',
    name: ApiRecallDocument.category.DOSSIER,
    type: 'generated',
    showOnFullView: true,
  },
  {
    label: 'Reasons for recall',
    name: ApiRecallDocument.category.REASONS_FOR_RECALL,
    type: 'generated',
    showOnFullView: true,
  },
  {
    label: 'Recall notification',
    name: ApiRecallDocument.category.RECALL_NOTIFICATION,
    type: 'generated',
    showOnFullView: true,
  },
  {
    label: 'Letter to prison',
    name: ApiRecallDocument.category.LETTER_TO_PRISON,
    type: 'generated',
    showOnFullView: true,
  },
]
