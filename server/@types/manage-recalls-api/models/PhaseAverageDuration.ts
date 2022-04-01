/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PhaseAverageDuration = {
    phase: PhaseAverageDuration.phase;
    averageDuration: number;
    count: number;
};

export namespace PhaseAverageDuration {

    export enum phase {
        BOOK = 'BOOK',
        ASSESS = 'ASSESS',
        DOSSIER = 'DOSSIER',
    }


}
