/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ConfirmedRecallTypeRequest = {
    confirmedRecallType: ConfirmedRecallTypeRequest.confirmedRecallType;
    confirmedRecallTypeDetail: string;
};

export namespace ConfirmedRecallTypeRequest {

    export enum confirmedRecallType {
        FIXED = 'FIXED',
        STANDARD = 'STANDARD',
    }


}
