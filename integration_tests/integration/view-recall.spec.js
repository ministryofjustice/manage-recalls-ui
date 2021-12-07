import path from 'path'
import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'

const recallInformationPage = require('../pages/recallInformation')

context('View a recall', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [
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
    cy.login()
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

  it('User can view all recall information', () => {
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'recallNotificationEmailSentDateTime',
      textToFind: '15 August 2021 at 14:04',
    })

    recallInformation.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'one, two' })
    recallInformation.assertElementHasText({ qaAttr: 'differentNomsNumber', textToFind: 'AC3408303' })
    recallInformation.assertElementHasText({
      qaAttr: 'dossierEmailSentDate',
      textToFind: '8 September 2021',
    })
    recallInformation.assertElementHasText({ qaAttr: 'dossierEmailSentDate', textToFind: '8 September 2021' })
    recallInformation.assertElementHasText({ qaAttr: 'dossierCreatedByUserName', textToFind: 'Bobby Badger' })
    recallInformation.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Dossier issued' })

    // generated documents
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

    // missing documents detail
    recallInformation.assertElementHasText({
      qaAttr: 'missingDocumentsDetail',
      textToFind: 'Documents were requested by email on 10/12/2020',
    })
  })

  it('User can view not available for additionalLicenceConditions,vulnerabilityDiversity and contraband when information is not provided', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
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
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'None' })
    recallInformation.assertElementHasText({ qaAttr: 'vulnerabilityDiversity', textToFind: 'No' })
    recallInformation.assertElementHasText({ qaAttr: 'contraband', textToFind: 'No' })
  })

  it('user can download all uploaded emails', () => {
    recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
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
    let fileName = 'recall-request.eml'
    mockFileDownload({ fileName, docCategory: 'RECALL_REQUEST_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-RECALL_REQUEST_EMAIL"]`).click()
    checkDownload(fileName)

    fileName = '2021-07-03 Phil Jones recall.msg'
    mockFileDownload({ fileName, docCategory: 'RECALL_NOTIFICATION_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-RECALL_NOTIFICATION_EMAIL"]`).click()

    checkDownload(fileName)
    cy.get(`[data-qa="uploadedDocument-DOSSIER_EMAIL"]`).click()
    cy.readFile(path.join(Cypress.config('downloadsFolder'), fileName), 'binary')
    fileName = 'chase-documents.msg'
    mockFileDownload({ fileName, docCategory: 'MISSING_DOCUMENTS_EMAIL' })
    cy.readFile(path.join(Cypress.config('downloadsFolder'), fileName), 'binary')
    cy.get(`[data-qa="uploadedDocument-MISSING_DOCUMENTS_EMAIL"]`).click()
  })
})
