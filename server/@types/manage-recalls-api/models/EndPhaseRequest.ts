/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type EndPhaseRequest = {
    phase: EndPhaseRequest.phase;
    shouldUnassign: boolean;
};

export namespace EndPhaseRequest {

    export enum phase {
        BOOK = 'BOOK',
        ASSESS = 'ASSESS',
        DOSSIER = 'DOSSIER',
    }


}
