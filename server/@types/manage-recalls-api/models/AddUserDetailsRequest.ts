/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AddUserDetailsRequest = {
    caseworkerBand: AddUserDetailsRequest.caseworkerBand;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    signature: string;
}

export namespace AddUserDetailsRequest {

    export enum caseworkerBand {
        FOUR_PLUS = 'FOUR_PLUS',
        THREE = 'THREE',
    }


}
