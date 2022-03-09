/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RecallResponseLite = {
    recallId: string;
    nomsNumber: string;
    createdByUserId: string;
    createdDateTime: string;
    lastUpdatedDateTime: string;
    firstName: string;
    middleNames?: string;
    lastName: string;
    licenceNameCategory: RecallResponseLite.licenceNameCategory;
    status: RecallResponseLite.status;
    inCustodyAtBooking?: boolean;
    inCustodyAtAssessment?: boolean;
    dossierEmailSentDate?: string;
    dossierTargetDate?: string;
    recallAssessmentDueDateTime?: string;
    assigneeUserName?: string;
    partBDueDate?: string;
};

export namespace RecallResponseLite {

    export enum licenceNameCategory {
        FIRST_LAST = 'FIRST_LAST',
        FIRST_MIDDLE_LAST = 'FIRST_MIDDLE_LAST',
        OTHER = 'OTHER',
    }

    export enum status {
        ASSESSED_NOT_IN_CUSTODY = 'ASSESSED_NOT_IN_CUSTODY',
        AWAITING_DOSSIER_CREATION = 'AWAITING_DOSSIER_CREATION',
        AWAITING_PART_B = 'AWAITING_PART_B',
        AWAITING_RETURN_TO_CUSTODY = 'AWAITING_RETURN_TO_CUSTODY',
        BEING_BOOKED_ON = 'BEING_BOOKED_ON',
        BOOKED_ON = 'BOOKED_ON',
        DOSSIER_IN_PROGRESS = 'DOSSIER_IN_PROGRESS',
        DOSSIER_ISSUED = 'DOSSIER_ISSUED',
        IN_ASSESSMENT = 'IN_ASSESSMENT',
        STOPPED = 'STOPPED',
    }


}
