import { getRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentVersionPage from '../pages/uploadNewDocumentVersion'

const recallInformationPage = require('../pages/recallInformation')

context('Uploaded document versions', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

  beforeEach(() => {
    cy.login()
  })

  it('user can go back from the view recall info page for a booked recall to upload a new document version', () => {
    const documentId = '123'
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
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
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    let recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocumentVersion = uploadDocumentVersionPage.verifyOnPage({
      documentCategoryLabel: 'part A recall report',
    })
    uploadDocumentVersion.assertLinkHref({
      qaAttr: 'previousVersionFileName',
      href: `/recalls/${recallId}/documents/123`,
    })
    uploadDocumentVersion.assertElementHasText({
      qaAttr: 'previousVersionNumber',
      textToFind: 'version 2',
    })
    uploadDocumentVersion.assertElementHasText({
      qaAttr: 'previousVersionUploadedDateTime',
      textToFind: 'Uploaded on 21 November 2021 at 12:34',
    })
    uploadDocumentVersion.uploadFile({
      fieldName: 'document',
      fileName: 'test.pdf',
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
            details: 'Some details',
          },
        ],
      },
    })
    uploadDocumentVersion.enterTextInInput({ name: 'details', text: 'Some details' })
    uploadDocumentVersion.clickContinue()
    uploadDocumentVersion.assertApiRequestBody({
      url: `/recalls/${recallId}/documents/uploaded`,
      method: 'POST',
      bodyValues: {
        category: 'PART_A_RECALL_REPORT',
        fileName: 'test.pdf',
        details: 'Some details',
      },
    })
    recallInformation = recallInformationPage.verifyOnPage({ personName })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-version',
      textToFind: 'version 2',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-details',
      textToFind: 'Some details',
    })
  })

  it('errors - add a new document version', () => {
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

    // details are not provided
    uploadDocumentVersion.uploadFile({
      fieldName: 'document',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocumentVersion.clickContinue()
    uploadDocumentVersion.assertErrorMessage({
      fieldName: 'details',
      summaryError: 'Provide more detail',
    })
  })
})
