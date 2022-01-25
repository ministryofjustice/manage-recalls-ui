/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LastKnownAddress = {
    createdByUserName: string;
    createdDateTime: string;
    index: number;
    lastKnownAddressId: string;
    line1: string;
    line2?: string;
    postcode?: string;
    source: LastKnownAddress.source;
    town: string;
}

export namespace LastKnownAddress {

    export enum source {
        LOOKUP = 'LOOKUP',
        MANUAL = 'MANUAL',
    }


}
