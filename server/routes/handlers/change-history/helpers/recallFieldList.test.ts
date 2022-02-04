import { changeHistoryFieldList, formatRecallFieldValue } from './recallFieldList'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import * as refDataExports from '../../../../referenceData'

const changedFields = [
  {
    auditCount: 0,
    auditId: 0,
    fieldName: 'probationOfficerPhoneNumber',
    fieldPath: 'probationInfo.probationOfficerPhoneNumber',
    updatedByUserName: 'Maria Badger',
    updatedDateTime: '2022-01-12T15:40:46.537Z',
  },
]

describe('changeHistoryFieldList', () => {
  it('should include changed fields and documents', () => {
    const uploadedDocuments = [
      {
        category: RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: '2021-07-03 Phil Jones recall.msg',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
      },
      {
        category: RecallDocument.category.RECALL_REQUEST_EMAIL,
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: 'recall-request.eml',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
      },
      {
        category: RecallDocument.category.DOSSIER_EMAIL,
        documentId: '845',
        fileName: 'dossier-letter.msg',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
      },
    ]
    const list = changeHistoryFieldList({ changedFields, uploadedDocuments })
    // filter out the list entries for fields that have history
    const fieldsWithHistory = list.filter(field => field.hasHistory)
    expect(fieldsWithHistory).toEqual([
      {
        documentCategory: 'DOSSIER_EMAIL',
        fieldPath: 'dossierSentEmailUploaded',
        fieldType: 'UPLOADED_EMAIL',
        hasHistory: true,
        id: 'dossierSentEmailUploaded',
        label: 'Dossier and letter email uploaded',
        updatedByUserName: 'Arnold Caseworker',
        updatedDateTime: '2020-12-05T18:33:57.000Z',
      },
      {
        fieldPath: 'probationInfo.probationOfficerPhoneNumber',
        fieldType: 'TEXT',
        hasHistory: true,
        id: 'probationOfficerPhoneNumber',
        label: 'Probation officer phone number',
        updatedByUserName: 'Maria Badger',
        updatedDateTime: '2022-01-12T15:40:46.537Z',
      },
      {
        documentCategory: 'RECALL_NOTIFICATION_EMAIL',
        fieldPath: 'recallNotificationSentEmailUploaded',
        fieldType: 'UPLOADED_EMAIL',
        hasHistory: true,
        id: 'recallNotificationSentEmailUploaded',
        label: 'Recall notification email uploaded',
        updatedByUserName: 'Arnold Caseworker',
        updatedDateTime: '2020-12-05T18:33:57.000Z',
      },
      {
        documentCategory: 'RECALL_REQUEST_EMAIL',
        fieldPath: 'recallRequestEmailUploaded',
        fieldType: 'UPLOADED_EMAIL',
        hasHistory: true,
        id: 'recallRequestEmailUploaded',
        label: 'Recall request email uploaded',
        updatedByUserName: 'Arnold Caseworker',
        updatedDateTime: '2020-12-05T18:33:57.000Z',
      },
    ])
  })

  it('should omit documents that have not been uploaded', () => {
    const uploadedDocuments = [] as RecallDocument[]
    const list = changeHistoryFieldList({ changedFields, uploadedDocuments })
    const emailFields = list.filter(field => field.fieldType === 'UPLOADED_EMAIL')
    emailFields.forEach(field => expect(field.hasHistory).toBe(false))
  })
})

describe('formatRecallFieldValue', () => {
  it('should alphabetically sort reasons for recall', () => {
    jest.spyOn(refDataExports, 'referenceData').mockReturnValue({
      reasonsForRecall: [
        {
          value: 'ELM_BREACH_EXCLUSION_ZONE',
          text: 'Electronic locking and monitoring (ELM) - Breach of exclusion zone - detected by ELM',
        },
        {
          value: 'POOR_BEHAVIOUR_ALCOHOL',
          text: 'Poor behaviour - Alcohol',
        },
        {
          value: 'TRAVELLING_OUTSIDE_UK',
          text: 'Travelling outside the UK',
        },
        {
          value: 'OTHER',
          text: 'Other',
        },
      ],
    } as any)
    const record = {
      auditId: 0,
      recallId: '11',
      updatedByUserName: 'Dave',
      updatedDateTime: '2021-10-03',
      updatedValue: ['TRAVELLING_OUTSIDE_UK', 'OTHER', 'ELM_BREACH_EXCLUSION_ZONE', 'POOR_BEHAVIOUR_ALCOHOL'],
    }
    const value = formatRecallFieldValue({ record, fieldName: 'reasonsForRecall' })
    expect(value).toEqual(
      'Electronic locking and monitoring (ELM) - Breach of exclusion zone - detected by ELM, Other, Poor behaviour - Alcohol, Travelling outside the UK'
    )
  })
})
