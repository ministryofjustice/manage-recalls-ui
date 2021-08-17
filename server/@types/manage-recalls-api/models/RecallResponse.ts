/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'

export type RecallResponse = {
  agreeWithRecallRecommendation?: boolean
  contrabandDetail?: string
  documents: Array<ApiRecallDocument>
  lastReleaseDate?: string
  sentenceDate?: string
  sentenceExpiryDate?: string
  licenceExpiryDate?: string
  conditionalReleaseDate?: string
  lastReleasePrison?: string
  localPoliceService?: string
  mappaLevel?: RecallResponse.mappaLevel
  nomsNumber: string
  recallEmailReceivedDateTime?: string
  recallId: string
  recallLength?: RecallResponse.recallLength
  revocationOrderId?: string
  vulnerabilityDiversityDetail?: string
  sentencingCourt?: string
  indexOffence?: string
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
}
