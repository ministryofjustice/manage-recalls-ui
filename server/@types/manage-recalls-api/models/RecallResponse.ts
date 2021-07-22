/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import { RecallDocument } from './RecallDocument'

export type RecallResponse = {
  recallId: string
  nomsNumber: string
  revocationOrderId?: string
  documents: Array<RecallDocument>
}
