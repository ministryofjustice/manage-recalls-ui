/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type GetDocumentResponse = {
    documentId: string;
    category: GetDocumentResponse.category;
    content: string;
    fileName: string;
    version?: number;
    details?: string;
    createdByUserName: string;
    createdDateTime: string;
};

export namespace GetDocumentResponse {

    export enum category {
        CHARGE_SHEET = 'CHARGE_SHEET',
        CPS_PAPERS = 'CPS_PAPERS',
        DOSSIER = 'DOSSIER',
        DOSSIER_EMAIL = 'DOSSIER_EMAIL',
        EXCLUSION_ZONE_MAP = 'EXCLUSION_ZONE_MAP',
        LETTER_TO_PRISON = 'LETTER_TO_PRISON',
        LICENCE = 'LICENCE',
        MISSING_DOCUMENTS_EMAIL = 'MISSING_DOCUMENTS_EMAIL',
        NSY_REMOVE_WARRANT_EMAIL = 'NSY_REMOVE_WARRANT_EMAIL',
        OASYS_RISK_ASSESSMENT = 'OASYS_RISK_ASSESSMENT',
        PART_A_RECALL_REPORT = 'PART_A_RECALL_REPORT',
        POLICE_REPORT = 'POLICE_REPORT',
        PREVIOUS_CONVICTIONS_SHEET = 'PREVIOUS_CONVICTIONS_SHEET',
        PRE_SENTENCING_REPORT = 'PRE_SENTENCING_REPORT',
        REASONS_FOR_RECALL = 'REASONS_FOR_RECALL',
        RECALL_NOTIFICATION = 'RECALL_NOTIFICATION',
        RECALL_NOTIFICATION_EMAIL = 'RECALL_NOTIFICATION_EMAIL',
        RECALL_REQUEST_EMAIL = 'RECALL_REQUEST_EMAIL',
        REVOCATION_ORDER = 'REVOCATION_ORDER',
        RESCIND_REQUEST_EMAIL = 'RESCIND_REQUEST_EMAIL',
        RESCIND_DECISION_EMAIL = 'RESCIND_DECISION_EMAIL',
        NOTE_DOCUMENT = 'NOTE_DOCUMENT',
        OTHER = 'OTHER',
        UNCATEGORISED = 'UNCATEGORISED',
    }


}
