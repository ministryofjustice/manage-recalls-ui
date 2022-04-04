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
    status: RecallResponseLite.status;
    inCustodyAtBooking?: boolean;
    inCustodyAtAssessment?: boolean;
    dossierEmailSentDate?: string;
    dossierTargetDate?: string;
    licenceNameCategory?: RecallResponseLite.licenceNameCategory;
    recallAssessmentDueDateTime?: string;
    secondaryDossierDueDate?: string;
    assigneeUserName?: string;
    partBDueDate?: string;
};

export namespace RecallResponseLite {

    export enum status {
        ASSESSED_NOT_IN_CUSTODY = 'ASSESSED_NOT_IN_CUSTODY',
        AWAITING_DOSSIER_CREATION = 'AWAITING_DOSSIER_CREATION',
        AWAITING_PART_B = 'AWAITING_PART_B',
        AWAITING_RETURN_TO_CUSTODY = 'AWAITING_RETURN_TO_CUSTODY',
        BEING_BOOKED_ON = 'BEING_BOOKED_ON',
        BOOKED_ON = 'BOOKED_ON',
        DOSSIER_IN_PROGRESS = 'DOSSIER_IN_PROGRESS',
        DOSSIER_ISSUED = 'DOSSIER_ISSUED',
        AWAITING_SECONDARY_DOSSIER_CREATION = 'AWAITING_SECONDARY_DOSSIER_CREATION',
        IN_ASSESSMENT = 'IN_ASSESSMENT',
        STOPPED = 'STOPPED',
    }

    export enum licenceNameCategory {
        FIRST_LAST = 'FIRST_LAST',
        FIRST_MIDDLE_LAST = 'FIRST_MIDDLE_LAST',
        OTHER = 'OTHER',
    }


}
