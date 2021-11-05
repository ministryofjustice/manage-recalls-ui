import path from 'path'
import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

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
            documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
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
    cy.get(`[data-qa="uploadedDocument-DOSSIER_EMAIL"]`).click()
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
    // missing documents
    recallInformation.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    recallInformation.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
  })
})
