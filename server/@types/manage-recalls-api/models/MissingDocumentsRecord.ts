/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MissingDocumentsRecord = {
    missingDocumentsRecordId: string;
    categories: Array<'PART_A_RECALL_REPORT' | 'LICENCE' | 'OASYS_RISK_ASSESSMENT' | 'PREVIOUS_CONVICTIONS_SHEET' | 'PRE_SENTENCING_REPORT' | 'CHARGE_SHEET' | 'CPS_PAPERS' | 'POLICE_REPORT' | 'EXCLUSION_ZONE_MAP' | 'RECALL_REQUEST_EMAIL' | 'RECALL_NOTIFICATION_EMAIL' | 'DOSSIER_EMAIL' | 'RECALL_NOTIFICATION' | 'REVOCATION_ORDER' | 'LETTER_TO_PRISON' | 'DOSSIER' | 'REASONS_FOR_RECALL' | 'MISSING_DOCUMENTS_EMAIL' | 'RESCIND_REQUEST_EMAIL' | 'RESCIND_DECISION_EMAIL' | 'OTHER' | 'UNCATEGORISED'>;
    emailId: string;
    emailFileName: string;
    details: string;
    version: number;
    createdByUserName: string;
    createdDateTime: string;
};
