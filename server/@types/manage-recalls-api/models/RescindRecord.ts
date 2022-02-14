/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RescindRecord = {
    rescindRecordId: string;
    version: number;
    createdByUserName: string;
    createdDateTime: string;
    lastUpdatedDateTime: string;
    requestDetails: string;
    requestEmailId: string;
    requestEmailFileName: string;
    requestEmailReceivedDate: string;
    approved?: boolean;
    decisionDetails?: string;
    decisionEmailId?: string;
    decisionEmailFileName?: string;
    decisionEmailSentDate?: string;
};
