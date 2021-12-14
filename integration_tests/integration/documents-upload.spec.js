import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import recallMissingDocumentsPage from '../pages/recallMissingDocuments'

const recallInformationPage = require('../pages/recallInformation')

context('Document upload', () => {
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

  it('an uploaded document is listed as uncategorised after upload if it has an unrecognisable filename', () => {
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    const documentId = '123'
    cy.task('expectAddRecallDocument', { status: 201, responseBody: { documentId } })
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
    uploadDocuments.upload({
      filePath: '../uploads/test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId}`,
      textToFind: 'test.pdf',
    })
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId}`,
      value: 'UNCATEGORISED',
    })
  })

  it("a document is given a suggested category if it's uncategorised and has a recognisable filename", () => {
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    const documentId = '123'
    cy.task('expectAddRecallDocument', { status: 201, responseBody: { documentId } })
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
    uploadDocuments.upload({
      filePath: '../uploads/test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId}`,
      textToFind: 'licence wesley holt.pdf',
    })
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId}`,
      value: 'LICENCE',
    })
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.selectFromDropdown({
      fieldName: `category-${documentId}`,
      value: 'OASys Risk Assessment',
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.selectFromDropdown({
      fieldName: `category-${documentId}`,
      value: 'OASys Risk Assessment',
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.clickContinue()
    uploadDocuments.assertDocumentUploadError({
      documentId: '123',
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })

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
    uploadDocuments.upload({
      filePath: '../uploads/test.pdf',
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
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })

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
    uploadDocuments.upload({
      filePath: '../uploads/test.pdf',
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

  it('an error is shown for an upload that fails to save to the API', () => {
    cy.task('expectAddRecallDocument', { statusCode: 500 })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.uploadSingleFile({
      filePath: '../uploads/test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertSummaryErrorMessage({
      fieldName: 'documents',
      summaryError: 'test.pdf could not be uploaded - try again',
    })
  })

  it('an error is shown for an upload containing a virus', () => {
    cy.task('expectAddRecallDocument', {
      statusCode: 400,
      responseBody: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.uploadSingleFile({
      filePath: '../uploads/test.pdf',
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
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId })
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
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
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
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
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
      href: '/persons/A1234AA/recalls/123/upload-document-version?fromPage=view-recall&fromHash=documents&versionedCategoryName=PART_A_RECALL_REPORT',
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
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId, personName })
    // change link for an uploaded document goes to the 'upload documents' page
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      textToFind: 'Part A.pdf',
    })
    checkAnswers.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/persons/A1234AA/recalls/123/upload-documents?fromPage=check-answers&fromHash=documents',
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
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId, personName })
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
      href: '/persons/A1234AA/recalls/123/upload-documents?fromPage=check-answers&fromHash=documents',
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
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-UNCATEGORISED-label',
      textToFind: 'Uncategorised',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-UNCATEGORISED',
      textToFind: 'report.pdf',
    })
    // no change link for an uncategorised document
    recallInformation.assertElementNotPresent({
      qaAttr: 'uploadedDocument-UNCATEGORISED-Change',
    })
  })
})
