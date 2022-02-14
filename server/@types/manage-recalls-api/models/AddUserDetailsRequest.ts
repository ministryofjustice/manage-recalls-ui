/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type AddUserDetailsRequest = {
    firstName: string;
    lastName: string;
    signature: string;
    email: string;
    phoneNumber: string;
    caseworkerBand: AddUserDetailsRequest.caseworkerBand;
};

export namespace AddUserDetailsRequest {

    export enum caseworkerBand {
        THREE = 'THREE',
        FOUR_PLUS = 'FOUR_PLUS',
    }


}
