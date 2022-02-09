/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import {RecallResponse} from "./RecallResponse";

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
    licenceNameCategory: RecallResponse.licenceNameCategory;
    middleNames?: string;
    nomsNumber: string;
    recallAssessmentDueDateTime?: string;
    recallId: string;
    status: RecallResponse.status;
}

