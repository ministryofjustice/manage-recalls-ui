import { getRecallResponse } from '../mockApis/mockResponses'

const recallInformationPage = require('../pages/recallInformation')
const changeHistoryPage = require('../pages/changeHistory')

context('Change history', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const documents = [
    {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: 'PREVIOUS_CONVICTIONS_SHEET',
      documentId: '456',
      createdDateTime: '2020-05-10T14:22:00.000Z',
    },
  ]

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
    cy.task('expectGetCurrentUserDetails')
    cy.login()
  })

  it('User can navigate to view change history for a recall, and resort the table', () => {
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
    // re-sort the table by file name (descending)
    changeHistory.clickButton({ label: 'Document' })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['Pre Cons.pdf', 'Part A.pdf'],
    })
    // re-sort the table by date (ascending)
    changeHistory.clickButton({ label: 'Date and time' })
    changeHistory.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'createdDateTime',
      valuesToCompare: ['1 April 2020 at 13:00', '10 May 2020 at 15:22'],
    })
  })

  it('User can see the document version and download it', () => {
    const document = {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
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
})
