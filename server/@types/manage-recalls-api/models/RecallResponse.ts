/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'

export type RecallResponse = {
  documents: Array<ApiRecallDocument>
  nomsNumber: string
  recallId: string
  recallLength?: RecallResponse.recallLength
  revocationOrderId?: string
}

export namespace RecallResponse {
  export enum recallLength {
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    TWENTY_EIGHT_DAYS = 'TWENTY_EIGHT_DAYS',
  }
}
