/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RescindRecord = {
  rescindRecordId: string;
  createdByUserName: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  version: number;
  requestDetails: string;
  requestEmailFileName: string;
  requestEmailId: string;
  requestEmailReceivedDate: string;
  approved?: boolean;
  decisionDetails?: string;
  decisionEmailFileName?: string;
  decisionEmailId?: string;
  decisionEmailSentDate?: string
}