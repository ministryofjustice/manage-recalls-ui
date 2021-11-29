import path from 'path'
import { getEmptyRecallResponse, getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentVersionPage from '../pages/uploadNewDocumentVersion'

const recallInformationPage = require('../pages/recallInformation')

context('View recall', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
        },
      ],
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
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
            documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          },
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'recall-request.eml',
          },
          {
            category: 'RECALL_NOTIFICATION_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: '2021-07-03 Phil Jones recall.msg',
          },
          {
            category: 'DOSSIER_EMAIL',
            documentId: '234-3455-8542-c3ac-8c963f66afa6',
            fileName: 'email.msg',
          },
          {
            category: 'MISSING_DOCUMENTS_EMAIL',
            documentId: '123',
            fileName: 'chase-documents.msg',
          },
          {
            category: 'RECALL_NOTIFICATION',
            documentId: '1123',
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
    cy.task('expectGetUserDetails', { firstName: 'Bobby', lastName: 'Badger' })
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

  const mockFileDownload = ({ fileName, docCategory }) => {
    cy.task('expectGetRecallDocument', {
      category: docCategory,
      file: 'abc',
      fileName,
      documentId: '123',
    })
  }
  const checkDownload = fileName => {
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
  }

  it('User can view all recall information', () => {
    cy.login()
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'recallNotificationEmailSentDateTime',
      textToFind: '15 August 2021 at 14:04',
    })

    let fileName = 'recall-request.eml'
    mockFileDownload({ fileName, docCategory: 'RECALL_REQUEST_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-RECALL_REQUEST_EMAIL"]`).click()
    checkDownload(fileName)

    fileName = '2021-07-03 Phil Jones recall.msg'
    mockFileDownload({ fileName, docCategory: 'RECALL_NOTIFICATION_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-RECALL_NOTIFICATION_EMAIL"]`).click()

    checkDownload(fileName)
    recallInformation.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'one, two' })
    recallInformation.assertElementHasText({ qaAttr: 'differentNomsNumber', textToFind: 'AC3408303' })
    recallInformation.assertElementHasText({
      qaAttr: 'dossierEmailSentDate',
      textToFind: '8 September 2021',
    })
    recallInformation.assertElementHasText({ qaAttr: 'dossierEmailSentDate', textToFind: '8 September 2021' })
    recallInformation.assertElementHasText({ qaAttr: 'dossierCreatedByUserName', textToFind: 'Bobby Badger' })
    recallInformation.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Dossier issued' })
    cy.get(`[data-qa="uploadedDocument-DOSSIER_EMAIL"]`).click()
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
    // change link for an uploaded document goes to the 'add new document version' page
    recallInformation.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/persons/A1234AA/recalls/123/upload-document-version?fromPage=view-recall&fromHash=documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })
    // missing documents
    recallInformation.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    recallInformation.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
    recallInformation.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION',
      textToFind: 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
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
    recallInformation.assertElementHasText({
      qaAttr: 'missingDocumentsDetail',
      textToFind: 'Documents were requested by email on 10/12/2020',
    })
    fileName = 'chase-documents.msg'
    mockFileDownload({ fileName, docCategory: 'MISSING_DOCUMENTS_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-MISSING_DOCUMENTS_EMAIL"]`).click()
  })

  it('User can view not available for additionalLicenceConditions,vulnerabilityDiversity and contraband when information is not provided', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.login()
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'Not available' })
    recallInformation.assertElementHasText({ qaAttr: 'vulnerabilityDiversity', textToFind: 'Not available' })
    recallInformation.assertElementHasText({ qaAttr: 'contraband', textToFind: 'Not available' })
  })

  it('User can view No, No and None respectively for additionalLicenceConditions,vulnerabilityDiversity and contraband when selected No', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        additionalLicenceConditions: false,
        vulnerabilityDiversity: false,
        contraband: false,
      },
    })
    cy.login()
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'None' })
    recallInformation.assertElementHasText({ qaAttr: 'vulnerabilityDiversity', textToFind: 'No' })
    recallInformation.assertElementHasText({ qaAttr: 'contraband', textToFind: 'No' })
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
    cy.login()
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
    cy.login()
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
})
