/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateLastKnownAddressRequest = {
    line1: string;
    line2?: string;
    postcode?: string;
    recallId: string;
    source: CreateLastKnownAddressRequest.source;
    town: string;
}

export namespace CreateLastKnownAddressRequest {

    export enum source {
        LOOKUP = 'LOOKUP',
        MANUAL = 'MANUAL',
    }


}
