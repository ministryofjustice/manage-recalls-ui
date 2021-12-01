/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserDetailsResponse = {
    caseworkerBand: UserDetailsResponse.caseworkerBand;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    signature: string;
    userId: string;
}

export namespace UserDetailsResponse {

    export enum caseworkerBand {
        FOUR_PLUS = 'FOUR_PLUS',
        THREE = 'THREE',
    }


}
