/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StopRecallRequest = {
    stopReason: StopRecallRequest.stopReason;
};

export namespace StopRecallRequest {

    export enum stopReason {
        ALTERNATIVE_INTERVENTION = 'ALTERNATIVE_INTERVENTION',
        DECEASED = 'DECEASED',
        HDC_WARNING_LETTER = 'HDC_WARNING_LETTER',
        INCORRECT_LICENCE = 'INCORRECT_LICENCE',
        LEGAL_REASON = 'LEGAL_REASON',
        NO_ACTION = 'NO_ACTION',
        NOT_APPLICABLE = 'NOT_APPLICABLE',
        NOT_SPECIFIED = 'NOT_SPECIFIED',
        RAISED_IN_ERROR = 'RAISED_IN_ERROR',
        SOS_WARNING_LETTER = 'SOS_WARNING_LETTER',
        UO_28DAY_AND_DEEMED_NOTIFIED = 'UO_28DAY_AND_DEEMED_NOTIFIED',
        WITHDRAWAL_BY_ACO = 'WITHDRAWAL_BY_ACO',
        RESCINDED = 'RESCINDED',
    }


}
