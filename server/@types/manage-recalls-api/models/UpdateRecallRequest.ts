/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SentenceLengthReq } from './SentenceLengthReq'

export type UpdateRecallRequest = {
  additionalLicenceConditions?: boolean
  additionalLicenceConditionsDetail?: string
  agreeWithRecall?: UpdateRecallRequest.agreeWithRecall
  agreeWithRecallDetail?: string
  assessedByUserId?: string
  authorisingAssistantChiefOfficer?: string
  bookedByUserId?: string
  bookedDateTime?: string
  bookingNumber?: string
  conditionalReleaseDate?: string
  contrabandDetail?: string
  currentPrison?: string
  differentNomsNumber?: boolean
  differentNomsNumberDetail?: string
  dossierEmailSentDate?: string
  hasDossierBeenChecked?: boolean
  hasOtherPreviousConvictionMainName?: boolean
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceConditionsBreached?: string
  licenceExpiryDate?: string
  localDeliveryUnit?: UpdateRecallRequest.localDeliveryUnit
  localPoliceForce?: string
  mappaLevel?: UpdateRecallRequest.mappaLevel
  previousConvictionMainName?: string
  probationOfficerEmail?: string
  probationOfficerName?: string
  probationOfficerPhoneNumber?: string
  reasonsForRecall?: Array<
    | 'BREACH_EXCLUSION_ZONE'
    | 'ELM_BREACH_EXCLUSION_ZONE'
    | 'ELM_BREACH_NON_CURFEW_CONDITION'
    | 'ELM_EQUIPMENT_TAMPER'
    | 'ELM_FAILURE_CHARGE_BATTERY'
    | 'ELM_FURTHER_OFFENCE'
    | 'FAILED_HOME_VISIT'
    | 'FAILED_KEEP_IN_TOUCH'
    | 'FAILED_RESIDE'
    | 'FAILED_WORK_AS_APPROVED'
    | 'OTHER'
    | 'POOR_BEHAVIOUR_ALCOHOL'
    | 'POOR_BEHAVIOUR_DRUGS'
    | 'POOR_BEHAVIOUR_FURTHER_OFFENCE'
    | 'POOR_BEHAVIOUR_NON_COMPLIANCE'
    | 'POOR_BEHAVIOUR_RELATIONSHIPS'
    | 'TRAVELLING_OUTSIDE_UK'
  >
  reasonsForRecallOtherDetail?: string
  recallEmailReceivedDateTime?: string
  recallNotificationEmailSentDateTime?: string
  sentenceDate?: string
  sentenceExpiryDate?: string
  sentenceLength?: SentenceLengthReq
  sentencingCourt?: string
  vulnerabilityDiversityDetail?: string
}

export namespace UpdateRecallRequest {
  export enum agreeWithRecall {
    NO_STOP = 'NO_STOP',
    YES = 'YES',
  }

  export enum mappaLevel {
    CONFIRMATION_REQUIRED = 'CONFIRMATION_REQUIRED',
    LEVEL_1 = 'LEVEL_1',
    LEVEL_2 = 'LEVEL_2',
    LEVEL_3 = 'LEVEL_3',
    NA = 'NA',
    NOT_KNOWN = 'NOT_KNOWN',
  }

  export enum localDeliveryUnit {
    CENTRAL_AUDIT_TEAM = 'CENTRAL_AUDIT_TEAM',
    ISLE_OF_MAN = 'ISLE_OF_MAN',
    NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  }
}
