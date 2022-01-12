import {
  getRecallResponse,
  getEmptyRecallResponse,
  getDocumentCategoryHistoryResponseJson,
  searchResponse,
  getFieldChangeHistoryResponseJson,
  getPrisonsResponse,
} from '../mockApis/mockResponses'

const recallInformationPage = require('../pages/recallInformation')
const changeHistoryPage = require('../pages/changeHistory')
const changeHistoryDocumentPage = require('../pages/changeHistoryDocument')
const changeHistoryFieldPage = require('../pages/changeHistoryField')
const { formatDateTimeFromIsoString } = require('../../server/routes/handlers/helpers/dates/format')

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
      fileName: 'RECALL NOTIFICATION.pdf',
      createdByUserName: 'Barry Arnold',
    },
    {
      category: 'DOSSIER',
      documentId: '012',
      createdDateTime: '2020-04-10T14:22:00.000Z',
      fileName: 'DOSSIER.pdf',
      createdByUserName: 'Steve Barry',
    },
  ]

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: [] })
    cy.login()
  })

  it('User can navigate to view document change history for a recall, and resort the tables', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents,
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.clickButton({ qaAttr: 'changeHistoryButton' })
    const changeHistory = changeHistoryPage.verifyOnPage()
    cy.get('#tab_documents').click()
    // UPLOADED DOCUMENTS
    changeHistory.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      href: '/persons/A1234AA/recalls/123/documents/123',
    })
    changeHistory.assertLinkHref({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
      href: '/persons/A1234AA/recalls/123/documents/456',
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
      href: '/persons/A1234AA/recalls/123/documents/789',
    })
    changeHistory.assertLinkHref({
      qaAttr: 'generatedDocument-DOSSIER',
      href: '/persons/A1234AA/recalls/123/documents/012',
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

  it('User can see the document version and download it', () => {
    const document = {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 3,
    }
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ nomsNumber, recallId })
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
    const changeHistory = changeHistoryPage.verifyOnPage({ nomsNumber, recallId })
    cy.get('#tab_documents').click()
    cy.task('expectGetRecallDocumentHistory', { expectedResult: getDocumentCategoryHistoryResponseJson })
    changeHistory.clickLink({ qaAttr: 'viewHistory-LICENCE' })
    const uploadedDocumentHistory = changeHistoryDocumentPage.verifyOnPage({
      isUploaded: true,
    })
    getDocumentCategoryHistoryResponseJson.forEach(doc => {
      const docId = doc.documentId
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-link`,
        textToFind: 'Licence.pdf',
      })
      uploadedDocumentHistory.assertLinkHref({
        qaAttr: `document-${docId}-link`,
        href: `/persons/${nomsNumber}/recalls/${recallId}/documents/${docId}`,
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
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/845`,
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
    }
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
      },
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    const changeHistory = changeHistoryPage.verifyOnPage({ nomsNumber, recallId })
    cy.get('#tab_documents').click()
    cy.task('expectGetRecallDocumentHistory', {
      expectedResult: [
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          createdDateTime: '2020-12-05T18:33:57.000Z',
          fileName: 'DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 1,
        },
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
          createdDateTime: '2020-12-06T18:33:57.000Z',
          fileName: 'DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 2,
        },
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
          createdDateTime: '2020-12-07T18:33:57.000Z',
          fileName: 'DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 3,
        },
      ],
    })
    changeHistory.clickLink({ qaAttr: 'viewHistory-DOSSIER' })
    const uploadedDocumentHistory = changeHistoryDocumentPage.verifyOnPage({
      isUploaded: false,
    })
    getDocumentCategoryHistoryResponseJson.forEach(doc => {
      const docId = doc.documentId
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-link`,
        textToFind: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
      })
      uploadedDocumentHistory.assertLinkHref({
        qaAttr: `document-${docId}-link`,
        href: `/persons/${nomsNumber}/recalls/${recallId}/documents/${docId}`,
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

  it('shows the change history of a field', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ nomsNumber, recallId })
    cy.task('expectGetFieldChangeHistory', { expectedResult: getFieldChangeHistoryResponseJson })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    changeHistory.clickLink({ qaAttr: 'viewHistory-currentPrison' })
    const fieldHistory = changeHistoryFieldPage.verifyOnPage()
    getFieldChangeHistoryResponseJson.forEach(() => {
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

  it("doesn't show a view history link for a field that has no value set", () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ nomsNumber, recallId })
    changeHistory.assertElementNotPresent({ qaAttr: 'viewHistory-currentPrison' })
  })
})
