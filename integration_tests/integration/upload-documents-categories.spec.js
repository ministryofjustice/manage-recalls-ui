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

  it('an uncategorised document can be recategorised if it has a suggested category', () => {
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.selectFromDropdown({
      fieldName: `category-${documentId}`,
      value: 'OASys report',
    })
    uploadDocuments.clickContinue()
    uploadDocuments.assertApiRequestBody({
      url: `/recalls/${recallId}/documents/${documentId}`,
      method: 'PATCH',
      bodyValues: {
        category: 'OASYS_RISK_ASSESSMENT',
      },
    })
    recallMissingDocumentsPage.verifyOnPage()
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.selectFromDropdown({
      fieldName: `category-${documentId}`,
      value: 'OASys report',
    })
    uploadDocuments.clickContinue()
    uploadDocuments.assertApiRequestBody({
      url: `/recalls/${recallId}/documents/${documentId}`,
      method: 'PATCH',
      bodyValues: {
        category: 'OASYS_RISK_ASSESSMENT',
      },
    })
    recallMissingDocumentsPage.verifyOnPage()
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.clickContinue()
    uploadDocuments.assertSummaryErrorMessage({
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId}`,
      textToFind: 'Pre Cons.pdf',
    })
    uploadDocuments.assertElementHasText({
      qaAttr: `category-label-PREVIOUS_CONVICTIONS_SHEET`,
      textToFind: 'Previous convictions sheet',
    })
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })

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
    uploadDocuments.uploadFile({
      fieldName: 'documents',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId2}`,
      textToFind: 'test.pdf',
    })
    uploadDocuments.selectFromDropdown({
      fieldName: `category-${documentId2}`,
      value: 'Previous convictions sheet',
    })
    uploadDocuments.clickContinue()
    uploadDocuments.assertSummaryErrorMessage({
      fieldName: documentId2,
      summaryError: 'You can only upload one previous convictions sheet',
    })
    // category dropdown should have the invalid category the user chose
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId2}`,
      value: 'PREVIOUS_CONVICTIONS_SHEET',
    })
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })

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
      },
    })
    uploadDocuments.uploadFile({
      fieldName: 'documents',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.selectFromDropdown({
      fieldName: `category-${documentId2}`,
      value: 'Other',
    })
    cy.task('expectSetDocumentCategory')
    uploadDocuments.clickContinue()
    recallMissingDocumentsPage.verifyOnPage()
    uploadDocuments.assertApiRequestBody({
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
    const checkAnswers = checkAnswersPage.verifyOnPage({ recallId, personName })
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-UNCATEGORISED-label',
      textToFind: 'Uncategorised',
    })
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-UNCATEGORISED',
      textToFind: 'report.pdf',
    })
    // change link for an uploaded document goes to the 'upload documents' page
    checkAnswers.assertLinkHref({
      qaAttr: 'uploadedDocument-UNCATEGORISED-Change',
      href: '/recalls/123/upload-documents?fromPage=check-answers&fromHash=uploaded-documents',
    })
  })

  it("from the view recall page, for a complete booking, an uncategorised document doesn't have a change link", () => {
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
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-UNCATEGORISED-label',
      textToFind: 'Uncategorised',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-UNCATEGORISED',
      textToFind: 'report.pdf',
    })
    // show change link for an uncategorised document
    recallInformation.assertElementPresent({
      qaAttr: 'uploadedDocument-UNCATEGORISED-Change',
    })
  })

  it.skip("a document is given a suggested category if it's uncategorised and has a recognisable filename", () => {
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

    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.uploadFile({
      fieldName: 'documents',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId}`,
      textToFind: 'licence wesley holt.pdf',
    })
    uploadDocuments.assertLinkHref({
      qaAttr: `link-${documentId}`,
      href: `/recalls/${recallId}/documents/${documentId}`,
    })
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId}`,
      value: 'LICENCE',
    })
  })

  it.skip('an uploaded document is listed as uncategorised after upload if it has an unrecognisable filename', () => {
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ recallId })
    uploadDocuments.uploadFile({
      fieldName: 'documents',
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId}`,
      textToFind: 'test.pdf',
    })
    uploadDocuments.assertLinkHref({
      qaAttr: `link-${documentId}`,
      href: `/recalls/${recallId}/documents/${documentId}`,
    })
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId}`,
      value: 'UNCATEGORISED',
    })
  })
})
