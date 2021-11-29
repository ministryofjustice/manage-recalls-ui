/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type MissingDocumentsRecord = {
    categories: Array<'CHARGE_SHEET' | 'CPS_PAPERS' | 'DOSSIER' | 'DOSSIER_EMAIL' | 'EXCLUSION_ZONE_MAP' | 'LETTER_TO_PRISON' | 'LICENCE' | 'MISSING_DOCUMENTS_EMAIL' | 'OASYS_RISK_ASSESSMENT' | 'OTHER' | 'PART_A_RECALL_REPORT' | 'POLICE_REPORT' | 'PREVIOUS_CONVICTIONS_SHEET' | 'PRE_SENTENCING_REPORT' | 'REASONS_FOR_RECALL' | 'RECALL_NOTIFICATION' | 'RECALL_NOTIFICATION_EMAIL' | 'RECALL_REQUEST_EMAIL' | 'REVOCATION_ORDER' | 'UNCATEGORISED'>;
    createdByUserId: string;
    createdDateTime: string;
    detail: string;
    emailId: string;
    missingDocumentsRecordId: string;
    version: number;
}