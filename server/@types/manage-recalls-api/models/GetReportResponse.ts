/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GetReportResponse = {
    category: GetReportResponse.category;
    mimeType: string;
    fileName: string;
    content: string;
};

export namespace GetReportResponse {

    export enum category {
        WEEKLY_RECALLS_NEW = 'WEEKLY_RECALLS_NEW',
    }


}
