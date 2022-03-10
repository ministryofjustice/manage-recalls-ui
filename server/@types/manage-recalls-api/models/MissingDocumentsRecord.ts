/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MissingDocumentsRecord = {
    missingDocumentsRecordId: string;
    categories: Array<'CHARGE_SHEET' | 'CPS_PAPERS' | 'DOSSIER' | 'EXCLUSION_ZONE_MAP' | 'LETTER_TO_PRISON' | 'LICENCE' | 'OASYS_RISK_ASSESSMENT' | 'PART_A_RECALL_REPORT' | 'PART_B_RISK_REPORT' | 'POLICE_REPORT' | 'PREVIOUS_CONVICTIONS_SHEET' | 'PRE_SENTENCING_REPORT' | 'REASONS_FOR_RECALL' | 'RECALL_NOTIFICATION' | 'REVOCATION_ORDER' | 'CHANGE_RECALL_TYPE_EMAIL' | 'DOSSIER_EMAIL' | 'MISSING_DOCUMENTS_EMAIL' | 'NSY_REMOVE_WARRANT_EMAIL' | 'RECALL_NOTIFICATION_EMAIL' | 'RECALL_REQUEST_EMAIL' | 'RESCIND_REQUEST_EMAIL' | 'RESCIND_DECISION_EMAIL' | 'NOTE_DOCUMENT' | 'OTHER' | 'UNCATEGORISED'>;
    emailId: string;
    emailFileName: string;
    details: string;
    version: number;
    createdByUserName: string;
    createdDateTime: string;
};
