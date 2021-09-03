/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ApiRecallDocument = {
  category: ApiRecallDocument.category
  documentId: string
  fileName?: string
}

export namespace ApiRecallDocument {
  export enum category {
    LICENCE = 'LICENCE',
    OASYS_RISK_ASSESSMENT = 'OASYS_RISK_ASSESSMENT',
    PART_A_RECALL_REPORT = 'PART_A_RECALL_REPORT',
    PREVIOUS_CONVICTIONS_SHEET = 'PREVIOUS_CONVICTIONS_SHEET',
    PRE_SENTENCING_REPORT = 'PRE_SENTENCING_REPORT',
    RECALL_NOTIFICATION_EMAIL = 'RECALL_NOTIFICATION_EMAIL',
  }
}
