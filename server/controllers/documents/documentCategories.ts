import { RecallDocument } from '../../@types/manage-recalls-api/models/RecallDocument'
import { DocumentCategoryMetadata } from '../../@types/documents'

export const documentCategories: DocumentCategoryMetadata[] = [
  {
    label: 'Choose a type',
    name: RecallDocument.category.UNCATEGORISED,
    type: 'document',
    multiple: true,
  },
  {
    label: 'Part A recall report',
    labelLowerCase: 'part A recall report',
    name: RecallDocument.category.PART_A_RECALL_REPORT,
    type: 'document',
    required: true,
    standardFileName: 'Part A.pdf',
    fileNamePatterns: ['part a'],
    versioned: true,
  },
  {
    label: 'Licence',
    name: RecallDocument.category.LICENCE,
    type: 'document',
    required: true,
    standardFileName: 'Licence.pdf',
    fileNamePatterns: ['licence'],
    versioned: true,
  },
  {
    label: 'Previous convictions sheet',
    name: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
    type: 'document',
    hintIfMissing: true,
    standardFileName: 'Pre Cons.pdf',
    fileNamePatterns: ['pre cons', 'previous convictions', 'mg16'],
    versioned: true,
  },
  {
    label: 'Pre-sentencing report',
    name: RecallDocument.category.PRE_SENTENCING_REPORT,
    type: 'document',
    standardFileName: 'PSR.pdf',
    fileNamePatterns: ['psr', 'pre sentencing'],
    versioned: true,
  },
  {
    label: 'OASys report',
    labelLowerCase: 'OASys report',
    name: RecallDocument.category.OASYS_RISK_ASSESSMENT,
    type: 'document',
    hintIfMissing: true,
    standardFileName: 'OASys.pdf',
    fileNamePatterns: ['oasys'],
    versioned: true,
  },
  {
    label: 'Charge sheet',
    name: RecallDocument.category.CHARGE_SHEET,
    type: 'document',
    standardFileName: 'Charge sheet.pdf',
    fileNamePatterns: ['charge sheet'],
    versioned: true,
  },
  {
    label: 'CPS papers',
    labelLowerCase: 'CPS papers',
    name: RecallDocument.category.CPS_PAPERS,
    type: 'document',
    standardFileName: 'CPS papers.pdf',
    fileNamePatterns: ['cps papers'],
    versioned: true,
  },
  {
    label: 'Police report',
    name: RecallDocument.category.POLICE_REPORT,
    type: 'document',
    standardFileName: 'Police report.pdf',
    fileNamePatterns: ['police report'],
    versioned: true,
  },
  {
    label: 'Exclusion zone map',
    name: RecallDocument.category.EXCLUSION_ZONE_MAP,
    type: 'document',
    standardFileName: 'Exclusion zone map.pdf',
    fileNamePatterns: ['exclusion map', 'exclusion zone'],
    versioned: true,
  },
  {
    label: 'Other',
    name: RecallDocument.category.OTHER,
    type: 'document',
    multiple: true,
  },
  {
    label: 'Note document uploaded',
    name: RecallDocument.category.NOTE_DOCUMENT,
    type: 'document',
    multiple: true,
  },
  {
    label: 'Recall request email uploaded',
    name: RecallDocument.category.RECALL_REQUEST_EMAIL,
    type: 'email',
  },
  {
    label: 'Recall notification email uploaded',
    name: RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
    type: 'email',
  },
  {
    label: 'Dossier and letter email uploaded',
    name: RecallDocument.category.DOSSIER_EMAIL,
    type: 'email',
  },
  {
    label: 'Rescind request email uploaded',
    name: RecallDocument.category.RESCIND_REQUEST_EMAIL,
    type: 'email',
  },
  {
    label: 'Rescind decision email uploaded',
    name: RecallDocument.category.RESCIND_DECISION_EMAIL,
    type: 'email',
  },
  {
    label: 'Missing documents email uploaded',
    name: RecallDocument.category.MISSING_DOCUMENTS_EMAIL,
    type: 'email',
  },
  {
    label: 'New Scotland Yard warrant email sent',
    name: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
    type: 'email',
  },
  {
    label: 'Recall notification',
    name: RecallDocument.category.RECALL_NOTIFICATION,
    type: 'generated',
    versioned: true,
  },
  {
    label: 'Revocation order',
    name: RecallDocument.category.REVOCATION_ORDER,
    type: 'generated',
    versioned: true,
  },
  {
    label: 'Letter to prison',
    name: RecallDocument.category.LETTER_TO_PRISON,
    type: 'generated',
    versioned: true,
  },
  {
    label: 'Dossier',
    name: RecallDocument.category.DOSSIER,
    type: 'generated',
    versioned: true,
  },
  {
    label: 'Reasons for recall',
    name: RecallDocument.category.REASONS_FOR_RECALL,
    type: 'generated',
    versioned: true,
  },
]
