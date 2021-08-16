/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UpdateRecallRequest = {
  agreeWithRecallRecommendation?: boolean
  contrabandDetail?: string
  lastReleaseDate?: string
  lastReleasePrison?: string
  localPoliceService?: string
  mappaLevel?: UpdateRecallRequest.mappaLevel
  recallEmailReceivedDateTime?: string
  recallLength?: UpdateRecallRequest.recallLength
  vulnerabilityDiversityDetail?: string
  sentenceDate?: string
  licenceExpiryDate?: string
  sentenceExpiryDate?: string
  sentencingCourt?: string
  indexOffence?: string
  conditionalReleaseDate?: string
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
