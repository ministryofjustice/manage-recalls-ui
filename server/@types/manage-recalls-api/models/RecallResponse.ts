/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'
import type { SentenceLengthRes } from './SentenceLengthRes'

export type RecallResponse = {
  agreeWithRecallRecommendation?: boolean
  authorisingAssistantChiefOfficer?: string
  bookingNumber?: string
  conditionalReleaseDate?: string
  contrabandDetail?: string
  documents: Array<ApiRecallDocument>
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceExpiryDate?: string
  localPoliceForce?: string
  mappaLevel?: RecallResponse.mappaLevel
  nomsNumber: string
  probationDivision?: RecallResponse.probationDivision
  probationOfficerEmail?: string
  probationOfficerName?: string
  probationOfficerPhoneNumber?: string
  recallEmailReceivedDateTime?: string
  recallId: string
  recallLength?: RecallResponse.recallLength
  revocationOrderId?: string
  sentenceDate?: string
  sentenceExpiryDate?: string
  sentenceLength?: SentenceLengthRes
  sentencingCourt?: string
  vulnerabilityDiversityDetail?: string
}

export namespace RecallResponse {
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
}
