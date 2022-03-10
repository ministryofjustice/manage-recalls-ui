import { getRecallResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import recallMissingDocumentsPage from '../pages/recallMissingDocuments'

const recallInformationPage = require('../pages/recallInformation')

context('Upload documents', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

  beforeEach(() => {
    cy.login()
  })

  it('errors - saving documents to API', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
      },
    })
    cy.task('expectUploadRecallDocument', { statusCode: 500 })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.uploadFile({
      fieldName: 'documents',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertSummaryErrorMessage({
      fieldName: 'documents',
      summaryError: 'test.pdf could not be uploaded - try again',
    })

    // upload containing a virus
    cy.task('expectUploadRecallDocument', {
      statusCode: 400,
      responseBody: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    uploadDocuments.uploadFile({
      fieldName: 'documents',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertSummaryErrorMessage({
      fieldName: 'documents',
      summaryError: 'test.pdf contains a virus',
    })
  })

  it('user can go back to delete documents from the check your answers page', () => {
    const documentId = '123'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.BEING_BOOKED_ON,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
          },
        ],
      },
    })
    cy.task('expectDeleteRecallDocument')
    cy.task('expectSetDocumentCategory')
    const checkAnswers = checkAnswersPage.verifyOnPage({ recallId })
    checkAnswers.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.clickElement({ qaAttr: `delete-${documentId}` })
    uploadDocuments.assertApiRequestBody({
      url: `/recalls/${recallId}/documents/${documentId}`,
      method: 'DELETE',
    })
    uploadDocuments.clickContinue()
    recallMissingDocumentsPage.verifyOnPage()
  })

  it("user can't go back to delete documents from the view recall page, for an incomplete booking", () => {
    const documentId = '123'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.BEING_BOOKED_ON,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
          },
        ],
      },
    })
    cy.task('expectDeleteRecallDocument')
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.assertElementNotPresent({ qaAttr: `delete-${documentId}` })
  })

  it('all uploaded documents are listed on the view recall page, with change links', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
            version: 2,
          },
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: '789',
            version: 1,
          },
          {
            category: 'OTHER',
            fileName: 'record.pdf',
            documentId: '456',
          },
        ],
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      textToFind: 'Part A.pdf',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-version',
      textToFind: 'version 2',
    })
    // change link for an uploaded document goes to the 'add new document version' page
    recallInformation.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/recalls/123/upload-document-version?fromPage=view-recall&fromHash=uploaded-documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-OTHER',
      textToFind: 'record.pdf',
    })
    // Other documents should not have change links
    recallInformation.assertElementNotPresent({
      qaAttr: 'uploadedDocument-OTHER-Change',
    })
  })

  it('from the check your answers page, for an incomplete booking, Change links for uploaded docs go to the upload page', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'BEING_BOOKED_ON',
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
            version: 1,
          },
        ],
      },
    })
    const checkAnswers = checkAnswersPage.verifyOnPage({ recallId, personName })
    // change link for an uploaded document goes to the 'upload documents' page
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      textToFind: 'Part A.pdf',
    })
    checkAnswers.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/recalls/123/upload-documents?fromPage=check-answers&fromHash=uploaded-documents',
    })
  })
})
