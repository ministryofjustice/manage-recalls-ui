/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiRecallDocument } from './ApiRecallDocument'

export type RecallResponse = {
  documents: Array<ApiRecallDocument>
  id: string
  nomsNumber: string
  recallId: string
  revocationOrderId?: string
}
