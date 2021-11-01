// eslint-disable-next-line no-shadow
export const enum reasonForRecall {
  BREACH_EXCLUSION_ZONE = 'BREACH_EXCLUSION_ZONE',
  ELM_BREACH_EXCLUSION_ZONE = 'ELM_BREACH_EXCLUSION_ZONE',
  ELM_BREACH_NON_CURFEW_CONDITION = 'ELM_BREACH_NON_CURFEW_CONDITION',
  ELM_FURTHER_OFFENCE = 'ELM_FURTHER_OFFENCE',
  ELM_EQUIPMENT_TAMPER = 'ELM_EQUIPMENT_TAMPER',
  ELM_FAILURE_CHARGE_BATTERY = 'ELM_FAILURE_CHARGE_BATTERY',
  FAILED_HOME_VISIT = 'FAILED_HOME_VISIT',
  FAILED_KEEP_IN_TOUCH = 'FAILED_KEEP_IN_TOUCH',
  FAILED_RESIDE = 'FAILED_RESIDE',
  FAILED_WORK_AS_APPROVED = 'FAILED_WORK_AS_APPROVED',
  POOR_BEHAVIOUR_ALCOHOL = 'POOR_BEHAVIOUR_ALCOHOL',
  POOR_BEHAVIOUR_FURTHER_OFFENCE = 'POOR_BEHAVIOUR_FURTHER_OFFENCE',
  POOR_BEHAVIOUR_DRUGS = 'POOR_BEHAVIOUR_DRUGS',
  POOR_BEHAVIOUR_NON_COMPLIANCE = 'POOR_BEHAVIOUR_NON_COMPLIANCE',
  POOR_BEHAVIOUR_RELATIONSHIPS = 'POOR_BEHAVIOUR_RELATIONSHIPS',
  TRAVELLING_OUTSIDE_UK = 'TRAVELLING_OUTSIDE_UK',
  OTHER = 'OTHER',
}

export const reasonsForRecall = [
  {
    value: reasonForRecall.BREACH_EXCLUSION_ZONE,
    text: 'Breach of exclusion zone',
  },
  {
    value: reasonForRecall.ELM_BREACH_EXCLUSION_ZONE,
    text: 'Electronic locking and monitoring (ELM) - Breach of exclusion zone - detected by ELM',
  },
  {
    value: reasonForRecall.ELM_BREACH_NON_CURFEW_CONDITION,
    text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
  },
  {
    value: reasonForRecall.ELM_FURTHER_OFFENCE,
    text: 'Electronic locking and monitoring (ELM) - Charged with a further offence - detected by ELM',
  },
  {
    value: reasonForRecall.ELM_EQUIPMENT_TAMPER,
    text: 'Electronic locking and monitoring (ELM) - Equipment tamper',
  },
  {
    value: reasonForRecall.ELM_FAILURE_CHARGE_BATTERY,
    text: 'Electronic locking and monitoring (ELM) - Failure to charge battery',
  },
  {
    value: reasonForRecall.FAILED_HOME_VISIT,
    text: 'Failed home visit',
  },
  {
    value: reasonForRecall.FAILED_KEEP_IN_TOUCH,
    text: 'Failed to keep in touch',
  },
  {
    value: reasonForRecall.FAILED_RESIDE,
    text: 'Failed to reside',
  },
  {
    value: reasonForRecall.FAILED_WORK_AS_APPROVED,
    text: 'Failed to work as approved',
  },
  {
    value: reasonForRecall.POOR_BEHAVIOUR_ALCOHOL,
    text: 'Poor behaviour - Alcohol',
  },
  {
    value: reasonForRecall.POOR_BEHAVIOUR_FURTHER_OFFENCE,
    text: 'Poor behaviour - Charged with a further offence',
  },
  {
    value: reasonForRecall.POOR_BEHAVIOUR_DRUGS,
    text: 'Poor behaviour - Drugs',
  },
  {
    value: reasonForRecall.POOR_BEHAVIOUR_NON_COMPLIANCE,
    text: 'Poor behaviour - Non-compliance',
  },
  {
    value: reasonForRecall.POOR_BEHAVIOUR_RELATIONSHIPS,
    text: 'Poor behaviour - Relationships',
  },
  {
    value: reasonForRecall.TRAVELLING_OUTSIDE_UK,
    text: 'Travelling outside the UK',
  },
  {
    value: reasonForRecall.OTHER,
    text: 'Other',
  },
]
