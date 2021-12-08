import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentVersionPage from '../pages/uploadNewDocumentVersion'

const recallInformationPage = require('../pages/recallInformation')

context('Document versions', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

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
        documents: [],
      },
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetUserDetails', { firstName: 'Bobby', lastName: 'Badger' })
    cy.login()
  })

  it('user can go back from the view recall info page for a booked recall to add a new document version', () => {
    const documentId = '123'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.DOSSIER_IN_PROGRESS,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
            version: 2,
            createdDateTime: '2021-11-21T12:34:30.000Z',
          },
        ],
      },
    })
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    let recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocumentVersion = uploadDocumentVersionPage.verifyOnPage({
      documentCategoryLabel: 'part A recall report',
    })
    uploadDocumentVersion.assertLinkHref({
      qaAttr: 'previousVersionFileName',
      href: '/persons/A1234AA/recalls/123/documents/123',
    })
    uploadDocumentVersion.assertElementHasText({
      qaAttr: 'previousVersionNumber',
      textToFind: 'version 2',
    })
    uploadDocumentVersion.assertElementHasText({
      qaAttr: 'previousVersionUploadedDateTime',
      textToFind: 'Uploaded on 21 November 2021 at 12:34',
    })
    uploadDocumentVersion.uploadSingleFile({
      filePath: '../uploads/test.pdf',
      mimeType: 'application/pdf',
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.DOSSIER_IN_PROGRESS,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
            version: 2,
          },
        ],
      },
    })
    uploadDocumentVersion.clickContinue()
    uploadDocumentVersion.assertApiRequestBody({
      url: `/recalls/${recallId}/documents`,
      method: 'POST',
      bodyValues: {
        category: 'PART_A_RECALL_REPORT',
        fileName: 'test.pdf',
      },
    })
    recallInformation = recallInformationPage.verifyOnPage({ personName })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-version',
      textToFind: 'version 2',
    })
  })

  it("an error is shown if a new document version isn't uploaded", () => {
    const documentId = '123'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.DOSSIER_IN_PROGRESS,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
            version: 2,
            createdDateTime: '2021-11-21T12:34:30.000Z',
          },
        ],
      },
    })
    const uploadDocumentVersion = uploadDocumentVersionPage.verifyOnPage({
      nomsNumber,
      recallId,
      documentCategoryLabel: 'part A recall report',
      documentCategoryName: 'PART_A_RECALL_REPORT',
    })
    uploadDocumentVersion.clickContinue()
    uploadDocumentVersion.assertErrorMessage({
      fieldName: 'document',
      summaryError: 'Select a file',
    })
  })
})
