/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UpdateRecallRequest = {
  agreeWithRecallRecommendation?: boolean
  recallLength?: UpdateRecallRequest.recallLength
}

export namespace UpdateRecallRequest {
  export enum recallLength {
    FOURTEEN_DAYS = 'FOURTEEN_DAYS',
    TWENTY_EIGHT_DAYS = 'TWENTY_EIGHT_DAYS',
  }
}
