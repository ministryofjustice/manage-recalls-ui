import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

export const reasonsForRecall = [
  {
    value: RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE,
    text: 'Breach of exclusion zone',
  },
  {
    value: RecallResponse.reasonForRecall.ELM_BREACH_EXCLUSION_ZONE,
    text: 'Electronic locking and monitoring (ELM) - breach of exclusion zone - detected by ELM',
  },
  {
    value: RecallResponse.reasonForRecall.ELM_BREACH_NON_CURFEW_CONDITION,
    text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
  },
  {
    value: RecallResponse.reasonForRecall.ELM_FURTHER_OFFENCE,
    text: 'Electronic locking and monitoring (ELM) - Charged with a further offence - detected by ELM',
  },
  {
    value: RecallResponse.reasonForRecall.ELM_EQUIPMENT_TAMPER,
    text: 'Electronic locking and monitoring (ELM) - Equipment tamper',
  },
  {
    value: RecallResponse.reasonForRecall.ELM_FAILURE_CHARGE_BATTERY,
    text: 'Electronic locking and monitoring (ELM) - Failure to charge battery',
  },
  {
    value: RecallResponse.reasonForRecall.FAILED_HOME_VISIT,
    text: 'Failed home visit',
  },
  {
    value: RecallResponse.reasonForRecall.FAILED_KEEP_IN_TOUCH,
    text: 'Failed to keep in touch',
  },
  {
    value: RecallResponse.reasonForRecall.FAILED_RESIDE,
    text: 'Failed to reside',
  },
  {
    value: RecallResponse.reasonForRecall.FAILED_WORK_AS_APPROVED,
    text: 'Failed to work as approved',
  },
  {
    value: RecallResponse.reasonForRecall.POOR_BEHAVIOUR_ALCOHOL,
    text: 'Poor behaviour - Alcohol',
  },
  {
    value: RecallResponse.reasonForRecall.POOR_BEHAVIOUR_FURTHER_OFFENCE,
    text: 'Poor behaviour - Charged with a further offence',
  },
  {
    value: RecallResponse.reasonForRecall.POOR_BEHAVIOUR_DRUGS,
    text: 'Poor behaviour - Drugs',
  },
  {
    value: RecallResponse.reasonForRecall.POOR_BEHAVIOUR_NON_COMPLIANCE,
    text: 'Poor behaviour - Non-compliance',
  },
  {
    value: RecallResponse.reasonForRecall.POOR_BEHAVIOUR_RELATIONSHIPS,
    text: 'Poor behaviour - Relationships',
  },
  {
    value: RecallResponse.reasonForRecall.TRAVELLING_OUTSIDE_UK,
    text: 'Travelling outside the UK',
  },
  {
    value: RecallResponse.reasonForRecall.OTHER,
    text: 'Other',
  },
]
