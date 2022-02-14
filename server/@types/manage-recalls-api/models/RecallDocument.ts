/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RecallDocument = {
    documentId: string;
    category: RecallDocument.category;
    fileName: string;
    version?: number;
    details?: string;
    createdDateTime: string;
    createdByUserName: string;
};

export namespace RecallDocument {

    export enum category {
        PART_A_RECALL_REPORT = 'PART_A_RECALL_REPORT',
        LICENCE = 'LICENCE',
        OASYS_RISK_ASSESSMENT = 'OASYS_RISK_ASSESSMENT',
        PREVIOUS_CONVICTIONS_SHEET = 'PREVIOUS_CONVICTIONS_SHEET',
        PRE_SENTENCING_REPORT = 'PRE_SENTENCING_REPORT',
        CHARGE_SHEET = 'CHARGE_SHEET',
        CPS_PAPERS = 'CPS_PAPERS',
        POLICE_REPORT = 'POLICE_REPORT',
        EXCLUSION_ZONE_MAP = 'EXCLUSION_ZONE_MAP',
        RECALL_REQUEST_EMAIL = 'RECALL_REQUEST_EMAIL',
        RECALL_NOTIFICATION_EMAIL = 'RECALL_NOTIFICATION_EMAIL',
        DOSSIER_EMAIL = 'DOSSIER_EMAIL',
        RECALL_NOTIFICATION = 'RECALL_NOTIFICATION',
        REVOCATION_ORDER = 'REVOCATION_ORDER',
        LETTER_TO_PRISON = 'LETTER_TO_PRISON',
        DOSSIER = 'DOSSIER',
        REASONS_FOR_RECALL = 'REASONS_FOR_RECALL',
        MISSING_DOCUMENTS_EMAIL = 'MISSING_DOCUMENTS_EMAIL',
        RESCIND_REQUEST_EMAIL = 'RESCIND_REQUEST_EMAIL',
        RESCIND_DECISION_EMAIL = 'RESCIND_DECISION_EMAIL',
        OTHER = 'OTHER',
        UNCATEGORISED = 'UNCATEGORISED',
    }


}
