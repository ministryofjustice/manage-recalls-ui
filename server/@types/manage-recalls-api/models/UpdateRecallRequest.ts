/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SentenceLengthReq } from './SentenceLengthReq'

export type UpdateRecallRequest = {
  agreeWithRecallRecommendation?: boolean
  conditionalReleaseDate?: string
  contrabandDetail?: string
  indexOffence?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  licenceExpiryDate?: string
  localPoliceService?: string
  mappaLevel?: UpdateRecallRequest.mappaLevel
  recallEmailReceivedDateTime?: string
  recallLength?: UpdateRecallRequest.recallLength
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

  export enum recallLength {
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    TWENTY_EIGHT_DAYS = 'TWENTY_EIGHT_DAYS',
  }
}
