/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserDetailsResponse = {
    userId: string;
    firstName: string;
    lastName: string;
    signature: string;
    email: string;
    phoneNumber: string;
    caseworkerBand: UserDetailsResponse.caseworkerBand;
};

export namespace UserDetailsResponse {

    export enum caseworkerBand {
        THREE = 'THREE',
        FOUR_PLUS = 'FOUR_PLUS',
    }


}
