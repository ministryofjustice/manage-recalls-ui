import { getRecallResponse, getDocumentCategoryHistoryResponseJson } from '../mockApis/mockResponses'

const recallInformationPage = require('../pages/recallInformation')
const changeHistoryPage = require('../pages/changeHistory')
const uploadedDocumentHistoryPage = require('../pages/uploadedDocumentHistory')
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

  it('User can navigate to view change history for a recall, and resort the tables', () => {
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

  it('User can navigate to uploaded document history', () => {
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
      },
    })
    const changeHistory = changeHistoryPage.verifyOnPage({ nomsNumber, recallId })
    cy.task('expectGetRecallDocumentHistory', { expectedResult: getDocumentCategoryHistoryResponseJson })
    changeHistory.clickLink({ qaAttr: 'viewHistory-LICENCE' })
    const uploadedDocumentHistory = uploadedDocumentHistoryPage.verifyOnPage({ nomsNumber, recallId, category })
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
          qaAttr: `document-${docId}-version`,
          textToFind: `(version ${doc.version})`,
        })
      }
      uploadedDocumentHistory.assertElementHasText({
        qaAttr: `document-${docId}-uploaded-by`,
        textToFind: `Uploaded by ${doc.createdByUserName} on ${formatDateTimeFromIsoString(doc.createdDateTime)}`,
      })
    })
  })
})
