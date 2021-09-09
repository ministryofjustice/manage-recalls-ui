/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'
import type { SentenceLengthRes } from './SentenceLengthRes'

export type RecallResponse = {
  additionalLicenceConditions?: boolean
  additionalLicenceConditionsDetail?: string
  agreeWithRecall?: RecallResponse.agreeWithRecall
  agreeWithRecallDetail?: string
  authorisingAssistantChiefOfficer?: string
  bookingNumber?: string
  conditionalReleaseDate?: string
  contrabandDetail?: string
  currentPrison?: string
  differentNomsNumber?: boolean
  differentNomsNumberDetail?: string
  documents: Array<ApiRecallDocument>
  dossierEmailSentDate?: string
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceConditionsBreached?: string
  licenceExpiryDate?: string
  localPoliceForce?: string
  mappaLevel?: RecallResponse.mappaLevel
  nomsNumber: string
  probationDivision?: RecallResponse.probationDivision
  probationOfficerEmail?: string
  probationOfficerName?: string
  probationOfficerPhoneNumber?: string
  reasonsForRecall: Array<
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
  recallId: string
  recallLength?: RecallResponse.recallLength
  recallNotificationEmailSentDateTime?: string
  revocationOrderId?: string
  sentenceDate?: string
  sentenceExpiryDate?: string
  sentenceLength?: SentenceLengthRes
  sentencingCourt?: string
  status?: RecallResponse.status
  vulnerabilityDiversityDetail?: string
}

export namespace RecallResponse {
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

  export enum probationDivision {
    LONDON = 'LONDON',
    MIDLANDS = 'MIDLANDS',
    NORTH_EAST = 'NORTH_EAST',
    NORTH_WEST = 'NORTH_WEST',
    SOUTH_EAST = 'SOUTH_EAST',
    SOUTH_WEST = 'SOUTH_WEST',
    SOUTH_WEST_AND_SOUTH_CENTRAL = 'SOUTH_WEST_AND_SOUTH_CENTRAL',
    WALES = 'WALES',
  }

  export enum recallLength {
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    TWENTY_EIGHT_DAYS = 'TWENTY_EIGHT_DAYS',
  }

  export enum status {
    BOOKED_ON = 'BOOKED_ON',
    RECALL_NOTIFICATION_ISSUED = 'RECALL_NOTIFICATION_ISSUED',
  }

  export enum reasonForRecall {
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
}
