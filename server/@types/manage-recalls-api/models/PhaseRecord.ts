/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PhaseRecord = {
    id: string;
    recallId: string;
    phase: PhaseRecord.phase;
    startedByUserId: string;
    startedDateTime: string;
    endedByUserId?: string;
    endedDateTime?: string;
};

export namespace PhaseRecord {

    export enum phase {
        BOOK = 'BOOK',
        ASSESS = 'ASSESS',
        DOSSIER = 'DOSSIER',
    }


}
