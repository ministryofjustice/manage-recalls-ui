/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'
import type { SentenceLengthRes } from './SentenceLengthRes'

export type RecallResponse = {
  agreeWithRecallRecommendation?: boolean
  conditionalReleaseDate?: string
  contrabandDetail?: string
  documents: Array<ApiRecallDocument>
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceExpiryDate?: string
  localPoliceService?: string
  mappaLevel?: RecallResponse.mappaLevel
  nomsNumber: string
  recallEmailReceivedDateTime?: string
  recallId: string
  recallLength?: RecallResponse.recallLength
  revocationOrderId?: string
  sentenceDate?: string
  sentenceExpiryDate?: string
  sentenceLength?: SentenceLengthRes
  sentencingCourt?: string
  vulnerabilityDiversityDetail?: string
  bookingNumber?: string
  probationOfficerName?: string
  probationOfficerPhoneNumber?: string
  probationOfficerEmail?: string
  probationDivision?: RecallResponse.probationDivision
  authorisingAssistantChiefOfficer?: string
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

  export enum recallLength {
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    TWENTY_EIGHT_DAYS = 'TWENTY_EIGHT_DAYS',
  }

  export enum probationDivision {
    LONDON = 'LONDON',
    MIDLANDS = 'MIDLANDS',
    NORTH_EAST = 'NORTH_EAST',
    NORTH_WEST = 'NORTH_WEST',
    SOUTH_WEST_CENTRAL = 'SOUTH_WEST_CENTRAL',
    SOUTH_EAST = 'SOUTH_EAST',
    WALES = 'WALES',
  }
}
