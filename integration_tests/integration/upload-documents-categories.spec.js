import { getRecallResponse } from '../mockApis/mockResponses'

context('Categorising documents', () => {
  const recallId = '123'

  beforeEach(() => {
    cy.login()
  })

  it('an uncategorised document can be categorised if it has a suggested category', () => {
    const documentId = '123'
    cy.task('expectSetDocumentCategory')
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        documents: [
          {
            category: 'UNCATEGORISED',
            fileName: 'licence wesley holt.pdf',
            documentId,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.selectFromDropdown('Select a category for licence wesley holt.pdf', 'OASys report')
    cy.clickButton('Continue')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/documents/${documentId}`,
      method: 'PATCH',
      bodyValues: {
        category: 'OASYS_RISK_ASSESSMENT',
      },
    })
    cy.pageHeading().should('contain', 'Check the details before booking this recall')
  })

  it("an uncategorised document can be recategorised if it doesn't have a suggested category", () => {
    const documentId = '123'
    cy.task('expectSetDocumentCategory')
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        documents: [
          {
            category: 'UNCATEGORISED',
            fileName: 'random.pdf',
            documentId,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.selectFromDropdown('Select a category for random.pdf', 'OASys report')
    cy.clickButton('Continue')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/documents/${documentId}`,
      method: 'PATCH',
      bodyValues: {
        category: 'OASYS_RISK_ASSESSMENT',
      },
    })
    cy.pageHeading().should('contain', 'Check the details before booking this recall')
  })

  it('clicking Continue with an uncategorised document shows an error', () => {
    const documentId = '123'
    cy.task('expectSetDocumentCategory')
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        documents: [
          {
            category: 'UNCATEGORISED',
            fileName: 'random.pdf',
            documentId,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: '123',
      summaryError: 'Choose a type for random.pdf',
    })
  })

  it("a previously categorised document can't have its category changed", () => {
    const documentId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.getText(`link-${documentId}`).should('contain', 'Pre Cons.pdf')
    cy.getText(`category-label-PREVIOUS_CONVICTIONS_SHEET`).should('contain', 'Previous convictions sheet')
  })

  it("an error is shown if more than one of a category that doesn't allow multiples, is uploaded", () => {
    const documentId1 = '123'
    const documentId2 = '456'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: documentId1,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })

    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: documentId1,
          },
          {
            category: 'UNCATEGORISED',
            documentId: documentId2,
            fileName: 'test.pdf',
          },
        ],
      },
    })
    cy.intercept('POST', '**/upload-documents*').as('upload')
    cy.uploadPDF({
      field: 'documents',
      file: 'test.pdf',
    })
    cy.wait('@upload')
    cy.getText(`link-${documentId2}`).should('contain', 'test.pdf')
    cy.selectFromDropdown('Select a category for test.pdf', 'Previous convictions sheet')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: documentId2,
      summaryError: 'You can only upload one previous convictions sheet',
    })
    // category dropdown should have the invalid category the user chose
    cy.getFormFieldByLabel('test.pdf').should('have.value', 'PREVIOUS_CONVICTIONS_SHEET')
  })

  it('more than one of a category that does allow multiples can be uploaded', () => {
    const documentId1 = '123'
    const documentId2 = '456'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'OTHER',
            documentId: documentId1,
            fileName: 'Other doc 1',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })

    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'OTHER',
            documentId: documentId1,
            fileName: 'Other doc 1',
          },
          {
            category: 'UNCATEGORISED',
            documentId: documentId2,
            fileName: 'test.pdf',
          },
        ],
        missingDocuments: {
          required: ['PART_A_RECALL_REPORT', 'LICENCE'],
          desired: ['OASYS_RISK_ASSESSMENT', 'PREVIOUS_CONVICTIONS_SHEET'],
        },
      },
    })
    cy.intercept('POST', '**/upload-documents*').as('upload')
    cy.uploadPDF({
      field: 'documents',
      file: 'test.pdf',
    })
    cy.wait('@upload')
    cy.selectFromDropdown('Select a category for test.pdf', 'Other')

    cy.task('expectSetDocumentCategory')
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', 'Missing documents')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/documents/${documentId2}`,
      method: 'PATCH',
      bodyValues: {
        category: 'OTHER',
      },
    })
  })

  it('from the check your answers page, for an incomplete booking, an uncategorised document is listed with a change link', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'BEING_BOOKED_ON',
        documents: [
          {
            category: 'UNCATEGORISED',
            documentId: '123',
            fileName: 'report.pdf',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'check-answers' })
    cy.recallInfo('Uncategorised').should('contain', 'report.pdf')
    // change link for an uploaded document goes to the 'upload documents' page
    cy.getLinkHref({
      qaAttr: 'uploadedDocument-UNCATEGORISED-Change',
    }).should('contain', '/recalls/123/upload-documents?fromPage=check-answers&fromHash=uploaded-documents')
  })

  it('from the view recall page, for a complete booking, an uncategorised document has a change link', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'BOOKED_ON',
        documents: [
          {
            category: 'UNCATEGORISED',
            documentId: '123',
            fileName: 'report.pdf',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Uncategorised').should('contain', 'report.pdf')
    // has change link for an uncategorised document
    cy.getElement({
      qaAttr: 'uploadedDocument-UNCATEGORISED-Change',
    }).should('exist')
  })

  it("a document is given a suggested category if it's uncategorised and has a recognisable filename", () => {
    const documentId = '123'
    cy.task('expectUploadRecallDocument', { status: 201, responseBody: { documentId } })
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        documents: [
          {
            category: 'UNCATEGORISED',
            fileName: 'licence wesley holt.pdf',
            documentId,
          },
        ],
      },
    })

    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.intercept('POST', '**/upload-documents*').as('upload')
    cy.uploadPDF({
      field: 'documents',
      file: 'test.pdf',
    })
    cy.wait('@upload')
    cy.getText(`link-${documentId}`).should('contain', 'licence wesley holt.pdf')
    cy.getFormFieldByLabel('Select a category for licence wesley holt.pdf').should('have.value', 'LICENCE')
  })

  it('an uploaded document is listed as uncategorised after upload if it has an unrecognisable filename', () => {
    const documentId = '123'
    cy.task('expectUploadRecallDocument', { status: 201, responseBody: { documentId } })
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        documents: [
          {
            category: 'UNCATEGORISED',
            fileName: 'test.pdf',
            documentId,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'upload-documents' })
    cy.intercept('POST', '**/upload-documents*').as('upload')
    cy.uploadPDF({
      field: 'documents',
      file: 'test.pdf',
    })
    cy.wait('@upload')
    cy.getText(`link-${documentId}`).should('contain', 'test.pdf')
    cy.getFormFieldByLabel('Select a category for test.pdf').should('have.value', 'UNCATEGORISED')
  })
})
