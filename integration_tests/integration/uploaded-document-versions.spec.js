import { getRecallResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'

context('Uploaded document versions', () => {
  const recallId = '123'

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
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.clickLink('Change Part A recall report')

    cy.pageHeading().should('contain', 'Upload a new part A recall report')
    cy.getLinkHref({ qaAttr: 'previousVersionFileName' }).should('contain', `/recalls/${recallId}/documents/123`)
    cy.getText('previousVersionNumber').should('contain', 'version 2')
    cy.getText('previousVersionUploadedDateTime').should('contain', 'Uploaded on 21 November 2021 at 12:34')
    cy.uploadPDF({
      field: 'document',
      file: 'test.pdf',
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
    cy.fillInput('Provide more detail', 'Some details')
    cy.clickButton('Continue')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/documents/uploaded`,
      method: 'POST',
      bodyValues: {
        category: 'PART_A_RECALL_REPORT',
        fileName: 'test.pdf',
        details: 'Some details',
      },
    })
    cy.pageHeading().should('contain', 'View the recall')
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT-version').should('contain', 'version 2')
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT-details').should('contain', 'Some details')
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
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-document-version?versionedCategoryName=PART_A_RECALL_REPORT' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'document',
      summaryError: 'Select a file',
    })

    // details are not provided
    cy.uploadPDF({
      field: 'document',
      file: 'test.pdf',
    })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'details',
      summaryError: 'Provide more detail',
    })
  })
})
