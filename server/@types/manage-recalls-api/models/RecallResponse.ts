/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'

export type RecallResponse = {
  agreeWithRecallRecommendation?: boolean
  documents: Array<ApiRecallDocument>
  nomsNumber: string
  recallId: string
  recallLength?: RecallResponse.recallLength
  revocationOrderId?: string
  lastReleasePrison?: string
  lastReleaseDateTime?: string
  recallEmailReceivedDateTime?: string
  contrabandDetail?: string
  vulnerabilityDiversityDetail?: string
  mappaLevel?: string
}

export namespace RecallResponse {
  export enum recallLength {
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    TWENTY_EIGHT_DAYS = 'TWENTY_EIGHT_DAYS',
  }
}
