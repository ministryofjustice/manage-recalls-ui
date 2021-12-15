import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import newGeneratedDocumentVersionPage from '../pages/newGeneratedDocumentVersion'

const recallInformationPage = require('../pages/recallInformation')

context('Generated document versions', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const documentId = '123'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [
          {
            category: 'RECALL_NOTIFICATION',
            documentId,
            version: 2,
            createdDateTime: '2021-11-21T12:34:30.000Z',
            details: 'Sentencing info changed',
          },
          {
            category: 'REVOCATION_ORDER',
            documentId: '2123',
          },
          {
            category: 'LETTER_TO_PRISON',
            documentId: '3123',
          },
          {
            category: 'DOSSIER',
            documentId: '4123',
          },
          {
            category: 'REASONS_FOR_RECALL',
            documentId: '5123',
          },
        ],
      },
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetUserDetails', { firstName: 'Bobby', lastName: 'Badger' })
    cy.task('expectGenerateRecallDocument', { statusCode: 201 })
    cy.login()
  })

  it("if a document hasn't been generated, it won't be listed on recall info", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [],
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-not-available',
      textToFind: 'Not available',
    })
    recallInformation.assertElementNotPresent({ qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-Change' })
  })

  it('all generated documents are listed and user can generate a new document version', () => {
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    // show link, version number, detail for a document with verion > 1
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION',
      textToFind: 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-version',
      textToFind: 'version 2',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-details',
      textToFind: 'Sentencing info changed',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-REVOCATION_ORDER',
      textToFind: 'BADGER BOBBY A123456 REVOCATION ORDER.pdf',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PRISON',
      textToFind: 'BADGER BOBBY A123456 LETTER TO PRISON.pdf',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-DOSSIER',
      textToFind: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-REASONS_FOR_RECALL',
      textToFind: 'BADGER BOBBY A123456 REASONS FOR RECALL.pdf',
    })
    recallInformation.clickElement({ qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-Change' })

    const newGeneratedDocumentVersion = newGeneratedDocumentVersionPage.verifyOnPage({
      documentCategoryLabel: 'recall notification',
    })
    newGeneratedDocumentVersion.enterTextInInput({ name: 'details', text: 'Sentencing date corrected.' })
    newGeneratedDocumentVersion.clickContinue()
    newGeneratedDocumentVersion.assertApiRequestBody({
      url: `/recalls/${recallId}/documents/generated`,
      method: 'POST',
      bodyValues: {
        category: 'RECALL_NOTIFICATION',
        details: 'Sentencing date corrected.',
      },
    })
    recallInformationPage.verifyOnPage({ personName })
  })

  it("an error is shown if details aren't entered", () => {
    const newGeneratedDocumentVersion = newGeneratedDocumentVersionPage.verifyOnPage({
      recallId,
      nomsNumber,
      documentCategoryName: 'RECALL_NOTIFICATION',
      documentCategoryLabel: 'recall notification',
    })
    newGeneratedDocumentVersion.clickContinue()
    newGeneratedDocumentVersion.assertErrorMessage({
      fieldName: 'details',
      errorMessage: 'Provide more detail',
      summaryError: 'Provide more detail',
    })
  })
})
