import { getReasonsForRecall } from '../clients/manageRecallsApiClient'
import { RecallReasonResponse } from '../@types/manage-recalls-api/models/RecallReasonResponse'
import { RefDataBaseClass } from './refDataBaseClass'

class ReasonsForRecall extends RefDataBaseClass {
  constructor() {
    super({ fetchData: getReasonsForRecall, formatList: ReasonsForRecall.formatReasonsForRecallList })
  }

  static formatReasonsForRecallList(list: RecallReasonResponse[]) {
    return list.map(({ id, name }: RecallReasonResponse) => ({
      value: id,
      text: name,
    }))
  }
}

export const reasonsForRecall = new ReasonsForRecall()

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
