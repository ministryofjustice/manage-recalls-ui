import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

export const documentTypes = [
  {
    name: 'partARecallReport',
    label: 'Part A recall report',
    category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
  },
  {
    name: 'oasysRiskAssessment',
    label: 'OASys Risk Assessment',
    category: ApiRecallDocument.category.OASYS_RISK_ASSESSMENT,
  },
  { name: 'licence', label: 'Licence', category: ApiRecallDocument.category.LICENCE },
  {
    name: 'previousConvictions',
    label: 'Previous convictions sheet',
    category: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
  },
  {
    name: 'preSentencingReport',
    label: 'Pre-sentencing report',
    category: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
  },
]
