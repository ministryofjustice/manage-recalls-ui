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
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceExpiryDate?: string
  localPoliceForce?: string
  mappaLevel?: UpdateRecallRequest.mappaLevel
  probationDivision?: UpdateRecallRequest.probationDivision
  probationOfficerEmail?: string
  probationOfficerName?: string
  probationOfficerPhoneNumber?: string
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
