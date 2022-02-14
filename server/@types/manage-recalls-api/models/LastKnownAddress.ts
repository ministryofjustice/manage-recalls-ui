/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LastKnownAddress = {
    lastKnownAddressId: string;
    line1: string;
    line2?: string;
    town: string;
    postcode?: string;
    source: LastKnownAddress.source;
    index: number;
    createdByUserName: string;
    createdDateTime: string;
};

export namespace LastKnownAddress {

    export enum source {
        MANUAL = 'MANUAL',
        LOOKUP = 'LOOKUP',
    }


}
