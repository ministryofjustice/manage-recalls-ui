/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MissingDocumentsRecord = {
    missingDocumentsRecordId: string;
    categories: Array<'CHARGE_SHEET' | 'CPS_PAPERS' | 'DOSSIER' | 'DOSSIER_EMAIL' | 'EXCLUSION_ZONE_MAP' | 'LETTER_TO_PRISON' | 'LICENCE' | 'MISSING_DOCUMENTS_EMAIL' | 'NSY_REMOVE_WARRANT_EMAIL' | 'OASYS_RISK_ASSESSMENT' | 'PART_A_RECALL_REPORT' | 'POLICE_REPORT' | 'PREVIOUS_CONVICTIONS_SHEET' | 'PRE_SENTENCING_REPORT' | 'REASONS_FOR_RECALL' | 'RECALL_NOTIFICATION' | 'RECALL_NOTIFICATION_EMAIL' | 'RECALL_REQUEST_EMAIL' | 'REVOCATION_ORDER' | 'RESCIND_REQUEST_EMAIL' | 'RESCIND_DECISION_EMAIL' | 'OTHER' | 'UNCATEGORISED'>;
    emailId: string;
    emailFileName: string;
    details: string;
    version: number;
    createdByUserName: string;
    createdDateTime: string;
};
