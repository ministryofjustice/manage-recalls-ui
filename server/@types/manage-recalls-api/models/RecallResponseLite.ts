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
};

export namespace RecallResponseLite {

    export enum licenceNameCategory {
        FIRST_LAST = 'FIRST_LAST',
        FIRST_MIDDLE_LAST = 'FIRST_MIDDLE_LAST',
        OTHER = 'OTHER',
    }

    export enum status {
        BEING_BOOKED_ON = 'BEING_BOOKED_ON',
        BOOKED_ON = 'BOOKED_ON',
        IN_ASSESSMENT = 'IN_ASSESSMENT',
        RECALL_NOTIFICATION_ISSUED = 'RECALL_NOTIFICATION_ISSUED',
        AWAITING_RETURN_TO_CUSTODY = 'AWAITING_RETURN_TO_CUSTODY',
        DOSSIER_IN_PROGRESS = 'DOSSIER_IN_PROGRESS',
        DOSSIER_ISSUED = 'DOSSIER_ISSUED',
        STOPPED = 'STOPPED',
    }


}
