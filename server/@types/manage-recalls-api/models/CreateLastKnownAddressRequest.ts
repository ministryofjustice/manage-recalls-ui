/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateLastKnownAddressRequest = {
    recallId?: string;
    line1: string;
    line2?: string;
    town: string;
    postcode?: string;
    source: CreateLastKnownAddressRequest.source;
};

export namespace CreateLastKnownAddressRequest {

    export enum source {
        MANUAL = 'MANUAL',
        LOOKUP = 'LOOKUP',
    }


}
