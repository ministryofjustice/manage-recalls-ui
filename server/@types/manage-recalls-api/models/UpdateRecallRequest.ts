/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SentenceLengthReq } from './SentenceLengthReq'

export type UpdateRecallRequest = {
  agreeWithRecallRecommendation?: boolean
  authorisingAssistantChiefOfficer?: string
  bookingNumber?: string
  conditionalReleaseDate?: string
  contrabandDetail?: string
  currentPrison?: string
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceConditionsBreached?: string
  licenceExpiryDate?: string
  localPoliceForce?: string
  mappaLevel?: UpdateRecallRequest.mappaLevel
  probationDivision?: UpdateRecallRequest.probationDivision
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
  sentenceDate?: string
  sentenceExpiryDate?: string
  sentenceLength?: SentenceLengthReq
  sentencingCourt?: string
  vulnerabilityDiversityDetail?: string
}

export namespace UpdateRecallRequest {
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
}
