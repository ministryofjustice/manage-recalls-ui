/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RecallResponseLite = {
    assigneeUserName?: string;
    createdByUserId: string;
    createdDateTime: string;
    dossierEmailSentDate?: string;
    dossierTargetDate?: string;
    firstName: string;
    inCustodyAtAssessment?: boolean;
    inCustodyAtBooking?: boolean;
    lastName: string;
    lastUpdatedDateTime: string;
    licenceNameCategory: RecallResponseLite.licenceNameCategory;
    middleNames?: string;
    nomsNumber: string;
    recallAssessmentDueDateTime?: string;
    recallId: string;
    status: RecallResponseLite.status;
}

export namespace RecallResponseLite {

    export enum licenceNameCategory {
        FIRST_LAST = 'FIRST_LAST',
        FIRST_MIDDLE_LAST = 'FIRST_MIDDLE_LAST',
        OTHER = 'OTHER',
    }

    export enum status {
        AWAITING_RETURN_TO_CUSTODY = 'AWAITING_RETURN_TO_CUSTODY',
        BEING_BOOKED_ON = 'BEING_BOOKED_ON',
        BOOKED_ON = 'BOOKED_ON',
        DOSSIER_IN_PROGRESS = 'DOSSIER_IN_PROGRESS',
        DOSSIER_ISSUED = 'DOSSIER_ISSUED',
        IN_ASSESSMENT = 'IN_ASSESSMENT',
        RECALL_NOTIFICATION_ISSUED = 'RECALL_NOTIFICATION_ISSUED',
        STOPPED = 'STOPPED',
    }


}
