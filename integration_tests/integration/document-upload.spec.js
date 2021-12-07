import { getEmptyRecallResponse, getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentVersionPage from '../pages/uploadNewDocumentVersion'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import recallMissingDocumentsPage from '../pages/recallMissingDocuments'

const recallInformationPage = require('../pages/recallInformation')

context('Document upload', () => {
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

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

  it('User sees a document listed after it is uploaded', () => {
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
      filePath: '../test.pdf',
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

  it('User sees previously saved documents', () => {
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
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId}`,
      value: 'PREVIOUS_CONVICTIONS_SHEET',
    })
  })

  it('User sees an error if an upload fails', () => {
    cy.task('expectAddRecallDocument', { statusCode: 400 })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.uploadSingleFile({
      filePath: '../test.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertSummaryErrorMessage({
      fieldName: 'documents',
      summaryError: 'test.pdf could not be uploaded - try again',
    })
  })

  it('User sees an error if an upload has a virus', () => {
    cy.task('expectAddRecallDocument', {
      statusCode: 400,
      responseBody: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.uploadSingleFile({
      filePath: '../test.pdf',
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
    uploadDocuments.clickContinue()
    recallMissingDocumentsPage.verifyOnPage()
  })

  it("user can't go back to delete documents from the view recall page", () => {
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

  it('user can go back to add documents from the check your answers page to see a list of missing documents', () => {
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
    checkAnswers.clickLink({ label: 'Add documents' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.assertListValues({
      qaAttrList: 'missingDocsList',
      valuesToCompare: ['Licence', 'Previous convictions sheet', 'OASys Risk Assessment'],
    })
  })

  it("user can't change the category of a document that has more than one version", () => {
    const documentId = '123'
    const recallResponse = {
      recallId,
      ...getRecallResponse,
      status: RecallResponse.status.BEING_BOOKED_ON,
      documents: [
        {
          category: 'PART_A_RECALL_REPORT',
          documentId,
          version: 2,
        },
      ],
    }
    cy.task('expectGetRecall', {
      expectedResult: recallResponse,
    })
    cy.task('expectDeleteRecallDocument')
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.assertElementHasText({
      qaAttr: `category-label-PART_A_RECALL_REPORT`,
      textToFind: 'Part A recall report',
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...recallResponse,
        documents: [
          ...recallResponse.documents,
          {
            category: 'PRE_SENTENCING_REPORT',
            documentId: '456',
          },
        ],
      },
    })
    uploadDocuments.uploadSingleFile({
      filePath: '../uploads/presentencing_report.pdf',
      mimeType: 'application/pdf',
    })
    uploadDocuments.assertElementPresent({ qaAttr: 'category-index-PRE_SENTENCING_REPORT' })
  })

  it("User sees an error if they don't upload the missing documents email or provide detail", () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    const recallMissingDocuments = recallMissingDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    recallMissingDocuments.clickContinue()
    recallMissingDocuments.assertErrorMessage({
      fieldName: 'missingDocumentsEmailFileName',
      summaryError: 'Select an email',
    })
    recallMissingDocuments.assertErrorMessage({
      fieldName: 'missingDocumentsDetail',
      summaryError: 'Provide more detail',
    })
  })

  it('user can go back from the view recall info page to add a new document version', () => {
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
      qaAttr: 'previousVersionUploadedDateTime',
      textToFind: 'Uploaded on 21 November 2021 at 12:34',
    })
    uploadDocumentVersion.uploadSingleFile({
      filePath: '../test.pdf',
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
            documentId: '34589',
            version: 2,
          },
        ],
      },
    })
    uploadDocumentVersion.clickContinue()
    recallInformation = recallInformationPage.verifyOnPage({ personName })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-version',
      textToFind: 'version 2',
    })
  })

  it("user sees an error if they don't upload a new document version", () => {
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
      fieldName: 'documents',
      summaryError: 'Select a file',
    })
  })

  it('User can view all uploaded documents on the recall information page', () => {
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
    // change link for an uploaded document goes to the 'add new document version' page
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      textToFind: 'Part A.pdf',
    })
    recallInformation.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/persons/A1234AA/recalls/123/upload-document-version?fromPage=view-recall&fromHash=documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'uploadedDocument-OTHER',
      textToFind: 'record.pdf',
    })
    // missing documents
    recallInformation.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    recallInformation.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
  })
})
