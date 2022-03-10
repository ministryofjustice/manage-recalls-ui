import {
  getRecallResponse,
  getEmptyRecallResponse,
  getDocumentCategoryHistoryResponseJson,
  getPrisonerResponse,
  getSingleFieldHistoryResponseJson,
  getAllFieldsHistoryResponseJson,
  getPrisonsResponse,
} from '../mockApis/mockResponses'
import { changeHistoryFieldList } from '../../server/controllers/changeHistory/helpers/recallFieldList'
import { stubRefData } from '../support/mock-api'

const changeHistoryPage = require('../pages/changeHistory')
const changeHistoryDocumentPage = require('../pages/changeHistoryDocument')
const changeHistoryFieldPage = require('../pages/changeHistoryField')
const { formatDateTimeFromIsoString } = require('../../server/controllers/utils/dates/format')

context('Change history', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const documents = [
    {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'wesley holt part A.pdf',
      createdByUserName: 'Arnold Caseworker',
    },
    {
      category: 'PREVIOUS_CONVICTIONS_SHEET',
      documentId: '456',
      createdDateTime: '2020-05-10T14:22:00.000Z',
      fileName: 'wesley holt pre cons.pdf',
      createdByUserName: 'Carrie Arnold',
    },
    {
      category: 'RECALL_NOTIFICATION',
      documentId: '789',
      createdDateTime: '2020-05-09T14:22:00.000Z',
      createdByUserName: 'Barry Arnold',
      fileName: 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
    },
    {
      category: 'DOSSIER',
      documentId: '012',
      createdDateTime: '2020-04-10T14:22:00.000Z',
      fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
      createdByUserName: 'Steve Barry',
    },
  ]

  beforeEach(() => {
    cy.login()
  })

  it('User can navigate to view document change history for a recall, and resort the tables', () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.pageHeading().should('equal', `View the recall for ${personName}`)
    cy.clickButton('Actions')
    cy.clickLink('View change history')
    const changeHistory = changeHistoryPage.verifyOnPage()
    cy.get('#tab_documents').click()
    // UPLOADED DOCUMENTS
    changeHistory.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      href: '/recalls/123/documents/123',
    })
    changeHistory.assertLinkHref({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
      href: '/recalls/123/documents/456',
    })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['Part A.pdf', 'Pre Cons.pdf'],
    })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'createdDateTime',
      valuesToCompare: ['1 April 2020 at 13:00', '10 May 2020 at 15:22'],
    })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'createdByUserName',
      valuesToCompare: ['Arnold Caseworker', 'Carrie Arnold'],
    })
    // re-sort the table by file name (descending)
    changeHistory.clickButton({ parentQaAttr: 'uploadedDocuments', label: 'Document' })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['Pre Cons.pdf', 'Part A.pdf'],
    })

    // GENERATED DOCUMENTS
    changeHistory.assertLinkHref({
      qaAttr: 'generatedDocument-RECALL_NOTIFICATION',
      href: '/recalls/123/documents/789',
    })
    changeHistory.assertLinkHref({
      qaAttr: 'generatedDocument-DOSSIER',
      href: '/recalls/123/documents/012',
    })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['BADGER BOBBY A123456 RECALL DOSSIER.pdf', 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf'],
    })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'createdDateTime',
      valuesToCompare: ['10 April 2020 at 15:22', '9 May 2020 at 15:22'],
    })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'createdByUserName',
      valuesToCompare: ['Steve Barry', 'Barry Arnold'],
    })
    // re-sort the table by file name (descending)
    changeHistory.clickButton({ parentQaAttr: 'generatedDocuments', label: 'Document' })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['IN CUSTODY RECALL BADGER BOBBY A123456.pdf', 'BADGER BOBBY A123456 RECALL DOSSIER.pdf'],
    })
  })

  it('User can see the uploaded document version and download it', () => {
    const document = {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 3,
    }
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    cy.get('#tab_documents').click()
    changeHistory.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-version',
      textToFind: 'version 3',
    })
    const fileName = 'Part A.pdf'
    cy.task('expectGetRecallDocument', {
      category: document.category,
      file: 'abc',
      fileName,
      documentId: '123',
    })
    changeHistory.checkPdfContents({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      fileContents: 'abc',
    })
  })

  it('can see uploaded document history and missing records', () => {
    const category = 'LICENCE'
    const document = {
      category,
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 3,
    }
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
        missingDocumentsRecords: [
          {
            missingDocumentsRecordId: '0120412-410124',
            emailId: '845',
            emailFileName: 'missing-documents.msg',
            categories: ['OASYS_RISK_ASSESSMENT', 'LICENCE'],
            details: 'Documents were requested by email on 10/12/2020',
            version: 2,
            createdByUserName: 'Bobby Badger',
            createdDateTime: '2021-03-12T12:24:03.000Z',
          },
        ],
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    cy.get('#tab_documents').click()
    cy.task('expectGetRecallDocumentHistory', { expectedResult: getDocumentCategoryHistoryResponseJson })
    changeHistory.clickLink({ qaAttr: 'viewHistory-LICENCE' })
    const uploadedDocumentHistory = changeHistoryDocumentPage.verifyOnPage({
      type: 'document',
    })
    getDocumentCategoryHistoryResponseJson.forEach(doc => {
      const docId = doc.documentId
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-link`,
        textToFind: 'Licence.pdf',
      })
      uploadedDocumentHistory.assertLinkHref({
        qaAttr: `document-${docId}-link`,
        href: `/recalls/${recallId}/documents/${docId}`,
      })
      if (doc.version === 1) {
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-heading`,
          textToFind: `Licence`,
        })
        uploadedDocumentHistory.assertElementNotPresent({
          qaAttr: `document-${docId}-version`,
        })
      } else {
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-heading`,
          textToFind: `Licence (version ${doc.version})`,
        })
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-details`,
          textToFind: doc.details,
        })
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-version`,
          textToFind: `(version ${doc.version})`,
        })
      }
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-uploaded-by`,
        textToFind: `Uploaded by ${doc.createdByUserName} on ${formatDateTimeFromIsoString(doc.createdDateTime)}`,
      })
    })
    // missing documents record
    uploadedDocumentHistory.assertElementHasText({
      qaAttr: 'missingDocumentsLabel',
      textToFind: 'Missing',
    })
    uploadedDocumentHistory.assertElementHasText({
      qaAttr: 'document-845-details',
      textToFind: 'Documents were requested by email on 10/12/2020',
    })
    uploadedDocumentHistory.assertLinkHref({
      qaAttr: 'missingDocumentsEmail',
      href: `/recalls/${recallId}/documents/845`,
    })
    uploadedDocumentHistory.assertElementHasText({
      qaAttr: 'document-845-uploaded-by',
      textToFind: 'Noted by Bobby Badger on 12 March 2021 at 12:24',
    })
  })

  it('User can navigate to generated document history', () => {
    const category = 'DOSSIER'
    const document = {
      category,
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 4,
      fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
    }
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
      },
    })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    cy.get('#tab_documents').click()
    cy.task('expectGetRecallDocumentHistory', {
      expectedResult: [
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          createdDateTime: '2020-12-05T18:33:57.000Z',
          fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 1,
        },
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
          createdDateTime: '2020-12-06T18:33:57.000Z',
          fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 2,
        },
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
          createdDateTime: '2020-12-07T18:33:57.000Z',
          fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 3,
        },
      ],
    })
    changeHistory.clickLink({ qaAttr: 'viewHistory-DOSSIER' })
    const uploadedDocumentHistory = changeHistoryDocumentPage.verifyOnPage({
      type: 'generated',
    })
    getDocumentCategoryHistoryResponseJson.forEach(doc => {
      const docId = doc.documentId
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-link`,
        textToFind: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
      })
      uploadedDocumentHistory.assertLinkHref({
        qaAttr: `document-${docId}-link`,
        href: `/recalls/${recallId}/documents/${docId}`,
      })
      if (doc.version === 1) {
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-heading`,
          textToFind: `Dossier`,
        })
        uploadedDocumentHistory.assertElementNotPresent({
          qaAttr: `document-${docId}-version`,
        })
      } else {
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-heading`,
          textToFind: `Dossier (version ${doc.version})`,
        })
        uploadedDocumentHistory.assertElementHasText({
          qaAttr: `document-${docId}-version`,
          textToFind: `(version ${doc.version})`,
        })
      }
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-uploaded-by`,
        textToFind: `Created by ${doc.createdByUserName} on ${formatDateTimeFromIsoString(doc.createdDateTime)}`,
      })
    })
  })

  it('shows a list of all fields with change history links', () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    const uploadedDocuments = [
      {
        category: 'RECALL_REQUEST_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: 'recall-request.eml',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
      {
        category: 'RECALL_NOTIFICATION_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: '2021-07-03 Phil Jones recall.msg',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
      {
        category: 'DOSSIER_EMAIL',
        documentId: '234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'email.msg',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
      {
        category: 'NSY_REMOVE_WARRANT_EMAIL',
        documentId: '234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'email.msg',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
    ]
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        documents: uploadedDocuments,
      },
    })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    const fieldList = changeHistoryFieldList({ changedFields: getAllFieldsHistoryResponseJson, uploadedDocuments })
    const baseHref = `/recalls/${recallId}/change-history`
    fieldList.forEach(field => {
      changeHistory.assertElementHasText({ qaAttr: `label-${field.id}`, textToFind: field.label })
      const href =
        field.fieldType === 'UPLOADED_EMAIL'
          ? `${baseHref}/document?category=${field.documentCategory}`
          : `${baseHref}/field?fieldName=${field.id}&fieldPath=${field.fieldPath}`
      changeHistory.assertLinkHref({
        qaAttr: `viewHistory-${field.id}`,
        href,
      })
    })
    // check user and date for one field
    cy.getRowValuesFromTable({ parent: '#table-info-entered', rowQaAttr: 'currentPrison' }).then(rowValues =>
      expect(rowValues).to.include.members(['Prison held in', '24 February 2022 at 16:45', 'Maria Badger'])
    )
    // check user and date for one email
    cy.getRowValuesFromTable({ parent: '#table-info-entered', rowQaAttr: 'dossierSentEmailUploaded' }).then(rowValues =>
      expect(rowValues).to.include.members([
        'Dossier and letter email uploaded',
        '5 October 2021 at 13:34',
        'Barry Caseworker',
      ])
    )
  })

  it('shows the change history of a field', () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
      },
    })
    cy.task('expectGetSingleFieldChangeHistory', { expectedResult: getSingleFieldHistoryResponseJson })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    changeHistory.clickLink({ qaAttr: 'viewHistory-currentPrison' })
    const fieldHistory = changeHistoryFieldPage.verifyOnPage()
    getSingleFieldHistoryResponseJson.forEach(() => {
      fieldHistory.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'dateAndTime',
        valuesToCompare: ['4 January 2022 at 17:56', '4 January 2022 at 13:17'],
      })
      fieldHistory.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'value',
        valuesToCompare: ['Ashfield (HMP)', 'Kennet (HMP)'],
      })
      fieldHistory.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'updatedByUserName',
        valuesToCompare: ['Marcus Baimbridge', 'Maria Badger'],
      })
    })
  })

  it('shows the change history of the reasons for recall field', () => {
    stubRefData()
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
      },
    })
    cy.task('expectGetSingleFieldChangeHistory', {
      expectedResult: [
        {
          auditId: 0,
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-04T13:17:34.443Z',
          updatedValue: ['ELM_BREACH_NON_CURFEW_CONDITION', 'OTHER'],
        },
        {
          auditId: 1,
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Marcus Baimbridge',
          updatedDateTime: '2022-01-04T17:56:22.000Z',
          updatedValue: ['OTHER'],
        },
      ],
    })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    changeHistory.clickLink({ qaAttr: 'viewHistory-reasonsForRecall' })
    const fieldHistory = changeHistoryFieldPage.verifyOnPage()
    getSingleFieldHistoryResponseJson.forEach(() => {
      fieldHistory.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'dateAndTime',
        valuesToCompare: ['4 January 2022 at 17:56', '4 January 2022 at 13:17'],
      })
      fieldHistory.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'value',
        valuesToCompare: [
          'Other',
          'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition, Other',
        ],
      })
      fieldHistory.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'updatedByUserName',
        valuesToCompare: ['Marcus Baimbridge', 'Maria Badger'],
      })
    })
  })

  it('shows the change history of an email', () => {
    const documentId = '123'
    const fileName = 'recall-request.eml'
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: [
        {
          fieldName: 'recallRequestEmailUploaded',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-12T15:40:46.537Z',
        },
      ],
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        documents: [
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId,
            fileName,
            createdDateTime: '2020-12-05T18:33:57.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
        ],
      },
    })

    cy.task('expectGetRecallDocumentHistory', {
      expectedResult: [
        {
          category: 'RECALL_REQUEST_EMAIL',
          documentId,
          createdDateTime: '2020-12-05T18:33:57.000Z',
          fileName,
          createdByUserName: 'Arnold Caseworker',
          version: 1,
        },
      ],
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    changeHistory.clickLink({ qaAttr: 'viewHistory-recallRequestEmailUploaded' })
    const emailHistory = changeHistoryDocumentPage.verifyOnPage({ type: 'email' })
    emailHistory.assertElementHasText({
      qaAttr: `document-${documentId}-heading`,
      textToFind: 'Recall request email uploaded',
    })
    emailHistory.assertElementHasText({
      qaAttr: `document-${documentId}-link`,
      textToFind: fileName,
    })
    emailHistory.assertLinkHref({
      qaAttr: `document-${documentId}-link`,
      href: `/recalls/${recallId}/documents/${documentId}`,
    })
  })

  it("doesn't show a view history link for a field that has no value set", () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: [],
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ recallId })
    changeHistory.assertElementNotPresent({ qaAttr: 'viewHistory-currentPrison' })
  })
})
