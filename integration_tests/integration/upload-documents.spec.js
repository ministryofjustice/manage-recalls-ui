import { getRecallResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'

context('Upload documents', () => {
  const recallId = '123'

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
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.uploadPDF({
      field: 'documents',
      file: 'test.pdf',
    })
    cy.assertErrorMessage({
      fieldName: 'documents',
      summaryError: 'test.pdf could not be uploaded - try again',
    })

    // upload containing a virus
    cy.task('expectUploadRecallDocument', {
      statusCode: 400,
      responseBody: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    cy.uploadPDF({
      field: 'documents',
      file: 'test.pdf',
    })
    cy.assertErrorMessage({
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
    cy.visitRecallPage({ recallId, pageSuffix: 'check-answers' })
    cy.clickLink('Change Part A recall report')
    cy.clickButton('Delete Part A.pdf')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/documents/${documentId}`,
      method: 'DELETE',
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Check the details before booking this recall')
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
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.clickLink('Change Part A recall report')
    cy.pageHeading().should('equal', 'Upload documents')
    cy.getElement({ qaAttr: `delete-${documentId}` }).should('not.exist')
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
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT').should('contain', 'Part A.pdf')
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT-version').should('contain', 'version 2')
    // change link for an uploaded document goes to the 'add new document version' page
    cy.getLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
    }).should(
      'contain',
      '/recalls/123/upload-document-version?fromPage=view-recall&fromHash=uploaded-documents&versionedCategoryName=PART_A_RECALL_REPORT'
    )
    cy.getText('uploadedDocument-OTHER').should('contain', 'record.pdf')
    // Other documents should not have change links
    cy.getElement({
      qaAttr: 'uploadedDocument-OTHER-Change',
    }).should('not.exist')
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
    cy.visitRecallPage({ recallId, pageSuffix: 'check-answers' })
    // change link for an uploaded document goes to the 'upload documents' page
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT').should('contain', 'Part A.pdf')
    cy.getLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
    }).should('contain', '/recalls/123/upload-documents?fromPage=check-answers&fromHash=uploaded-documents')
  })
})
