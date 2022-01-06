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
        ],
      },
    })
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
    recallInformation.assertElementHasText({ qaAttr: 'bookedByUserName', textToFind: 'Brenda Badger' })
    recallInformation.assertElementHasText({ qaAttr: 'assessedByUserName', textToFind: 'Bertie Badger' })

    recallInformation.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Dossier complete' })

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
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    const mockFileDownload = ({ fileName, category }) => {
      cy.task('expectGetRecallDocument', {
        category,
        file: 'abc',
        fileName,
        documentId: '123',
      })
    }

    // recall request
    let fileName = 'recall-request.eml'
    mockFileDownload({ fileName, category: 'RECALL_REQUEST_EMAIL' })
    recallInformation.clickButton({ qaAttr: 'uploadedDocument-RECALL_REQUEST_EMAIL' })
    recallInformation.checkFileDownloaded(fileName)

    // sent recall notification email
    fileName = '2021-07-03 Phil Jones recall.msg'
    mockFileDownload({ fileName, category: 'RECALL_NOTIFICATION_EMAIL' })
    recallInformation.clickButton({ qaAttr: 'uploadedDocument-RECALL_NOTIFICATION_EMAIL' })
    recallInformation.checkFileDownloaded(fileName)

    // sent dossier email
    fileName = 'dossier-email.msg'
    mockFileDownload({ fileName, category: 'RECALL_REQUEST_EMAIL' })
    recallInformation.clickButton({ qaAttr: 'uploadedDocument-DOSSIER_EMAIL' })
    recallInformation.checkFileDownloaded(fileName)

    // sent missing documents email
    fileName = 'missing-documents.msg'
    mockFileDownload({ fileName, category: 'MISSING_DOCUMENTS_EMAIL' })
    recallInformation.clickButton({ qaAttr: 'missingDocumentsEmail' })
    recallInformation.checkFileDownloaded(fileName)
  })
})
