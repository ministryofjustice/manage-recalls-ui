import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'

const recallInformationPage = require('../pages/recallInformation')

context('View recall information', () => {
  beforeEach(() => {
    cy.login()
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        middleNames: '',
        inCustodyAtBooking: true,
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
        returnedToCustodyDateTime: undefined,
      },
    })
  })

  const recallId = '123'
  const personName = 'Bobby Badger'

  it('User can view all recall information (after dossier issued)', () => {
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Dossier complete' })

    // as person doesn't have middle names, don't offer a change link for name
    cy.getElement('Change licence name').should('not.exist')

    recallInformation.assertElementHasText({
      qaAttr: 'inCustodyAtBooking',
      textToFind: 'In custody',
    })
    recallInformation.assertElementNotPresent({ qaAttr: 'inCustodyChange' })
    recallInformation.assertElementNotPresent({ qaAttr: 'arrestIssues' })
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
    recallInformation.assertElementHasText({ qaAttr: 'bookedByUserName', textToFind: 'Brenda Badger' })
    recallInformation.assertElementHasText({ qaAttr: 'assessedByUserName', textToFind: 'Bertie Badger' })
    recallInformation.assertElementHasText({ qaAttr: 'dossierCreatedByUserName', textToFind: 'Bobby Badger' })

    cy.recallInfo('Dossier sent').should('equal', '8 September 2021')
    cy.recallInfo('Dossier email uploaded').should('equal', 'email.msg')
    cy.getLinkHref('Change dossier email sent date').should('contain', '/dossier-email')
    cy.getLinkHref('Change uploaded dossier email').should('contain', '/dossier-email')
  })

  it('User can view not available for vulnerabilityDiversity and contraband when information is not provided', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        inCustody: false,
        status: 'DOSSIER_ISSUED',
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.assertElementHasText({ qaAttr: 'vulnerabilityDiversity', textToFind: 'Not available' })
    recallInformation.assertElementHasText({ qaAttr: 'contraband', textToFind: 'Not available' })
    recallInformation.assertElementHasText({ qaAttr: 'arrestIssues', textToFind: 'Not available' })
  })

  it('User can view No, No and None respectively for additionalLicenceConditions,vulnerabilityDiversity and contraband when selected No', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        additionalLicenceConditions: false,
        vulnerabilityDiversity: false,
        arrestIssues: false,
        contraband: false,
        status: 'DOSSIER_ISSUED',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        returnedToCustodyDateTime: undefined,
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'None' })
    recallInformation.assertElementHasText({ qaAttr: 'vulnerabilityDiversity', textToFind: 'No' })
    recallInformation.assertElementHasText({ qaAttr: 'contraband', textToFind: 'No' })
    recallInformation.assertElementHasText({ qaAttr: 'arrestIssues', textToFind: 'No' })
  })

  it('user can download all uploaded emails', () => {
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
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
  })
})
