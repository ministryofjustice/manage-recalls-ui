import path from 'path'
import {
  getRecallResponse,
  searchResponse,
  getEmptyRecallResponse,
  getLocalDeliveryUnitsResponse,
  getPrisonsResponse,
  getCourtsResponse,
} from '../mockApis/mockResponses'
import recallsListPage from '../pages/recallsList'

const assessRecallPage = require('../pages/assessRecall')
const assessRecallDecisionPage = require('../pages/assessRecallDecision')
const assessRecallPrisonPage = require('../pages/assessRecallPrison')
const assessRecallConfirmationPage = require('../pages/assessRecallConfirmation')
const assessRecallLicencePage = require('../pages/assessRecallLicence')
const assessRecallDownloadPage = require('../pages/assessRecallDownload')
const assessRecallEmailPage = require('../pages/assessRecallEmail')
const assessRecallStopPage = require('../pages/assessRecallStop')

context('Assess a recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'BOOKED_ON'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
        },
      ],
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'BOOKED_ON',
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
            version: 1,
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
        ],
      },
    })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectUnassignAssessment', { expectedResult: getRecallResponse })
    cy.task('expectGetUserDetails', { firstName: 'Bertie', lastName: 'Badger' })
    cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
  })

  const checkDownload = fileName => {
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
  }

  it('User can view recall information before assessing', () => {
    cy.login()
    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
    assessRecall.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Booked on' })
    assessRecall.assertElementHasText({
      qaAttr: 'recallAssessmentDueText',
      textToFind: 'Overdue: recall assessment was due on 6 August 2020 by 16:33',
    })
    assessRecall.assertLinkHref({
      qaAttr: 'recallEmailReceivedDateTimeChange',
      href: `/persons/${nomsNumber}/recalls/${recallId}/request-received`,
    })
    assessRecall.assertLinkHref({
      qaAttr: 'recallRequestEmailFileNameChange',
      href: `/persons/${nomsNumber}/recalls/${recallId}/request-received`,
    })

    // change link for an uploaded document goes to the 'add new document version' page
    assessRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/persons/A1234AA/recalls/123/upload-document-version?fromPage=assess&fromHash=documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })

    // missing documents
    assessRecall.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    assessRecall.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
  })

  it('User can assess a recall', () => {
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.assessRecall({ recallId })
    const assessRecall = assessRecallPage.verifyOnPage({ fullName: personName })
    assessRecall.clickContinue()
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage()
    assessRecallDecision.makeYesDecision()
    assessRecallDecision.addYesDetail()
    assessRecallDecision.clickContinue()
    const assessRecallLicence = assessRecallLicencePage.verifyOnPage()
    assessRecallLicence.enterLicenceConditionsBreached()
    assessRecallLicence.checkReasonsRecalled()
    assessRecallLicence.clickContinue()
    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ personName })
    assessRecallPrison.enterPrison()
    assessRecallPrison.clickContinue()
    const assessRecallDownload = assessRecallDownloadPage.verifyOnPage()
    assessRecallDownload.checkRecallNotificationLink({ noms: nomsNumber, recall: recallId })
    assessRecallDownload.assertElementHasText({
      qaAttr: 'getRecallNotificationFileName',
      textToFind: 'Filename: IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
    })
    assessRecallDownload.clickContinue()
    const assessRecallEmail = assessRecallEmailPage.verifyOnPage()
    assessRecallEmail.confirmEmailSent()
    assessRecallEmail.clickTodayLink()
    assessRecallEmail.enterDateTime({
      prefix: 'recallNotificationEmailSentDateTime',
      values: {
        Hour: '00',
        Minute: '00',
      },
    })
    assessRecallEmail.uploadFile({ fieldName: 'recallNotificationEmailFileName', fileName: 'email.msg' })
    assessRecallEmail.clickContinue()
    assessRecallConfirmationPage.verifyOnPage({ fullName: personName })
  })

  it("User sees an error if they don't make a decision", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: { ...getEmptyRecallResponse, recallLength: 'FOURTEEN_DAYS', recallId },
    })
    cy.login()
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallDecision.clickContinue()
    assessRecallDecision.assertErrorMessage({
      fieldName: 'agreeWithRecall',
      summaryError: 'Do you agree with the recall recommendation?',
    })
  })

  it("User sees an error if they don't add detail on their decision", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: { ...getEmptyRecallResponse, recallLength: 'FOURTEEN_DAYS', recallId },
    })
    cy.login()
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallDecision.makeYesDecision()
    assessRecallDecision.clickContinue()
    assessRecallDecision.assertErrorMessage({
      fieldName: 'agreeWithRecallDetailYes',
      summaryError: 'Provide more detail',
    })
  })

  it('User can stop a recall', () => {
    cy.login()
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallDecision.makeNoDecision()
    assessRecallDecision.addNoDetail()
    assessRecallDecision.clickContinue()
    const assessRecallStop = assessRecallStopPage.verifyOnPage({ personName })
    assessRecallStop.assertElementHasText({ qaAttr: 'managerName', textToFind: '[name]' })
    assessRecallStop.assertElementHasText({ qaAttr: 'managerPhone', textToFind: '[phone]' })
  })

  it("User sees an error if they don't enter licence details", () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.login()

    const assessRecallLicence = assessRecallLicencePage.verifyOnPage({ nomsNumber, recallId, personName })
    assessRecallLicence.clickContinue()
    assessRecallLicence.assertErrorMessage({
      fieldName: 'licenceConditionsBreached',
      summaryError: 'Enter the licence conditions breached',
    })
    assessRecallLicence.assertErrorMessage({
      fieldName: 'reasonsForRecall',
      summaryError: 'Select reasons for recall',
    })
  })

  it("User sees an error if they don't enter current prison", () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.login()

    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ nomsNumber, recallId, personName })
    assessRecallPrison.clickContinue()
    assessRecallPrison.assertErrorMessage({
      fieldName: 'currentPrison',
      summaryError: 'Select a prison',
    })
  })

  it('User sees an invalid input for current prison', () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.login()
    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ nomsNumber, recallId, personName })
    cy.get('[id="currentPrison"]').clear().type('blah blah blah')
    assessRecallPrison.clickContinue()
    assessRecallPrison.assertSelectValue({ fieldName: 'currentPrisonInput', value: 'blah blah blah' })
    assessRecallPrison.assertErrorMessage({
      fieldName: 'currentPrison',
      summaryError: 'Select a prison from the list',
    })
  })

  it("User sees an error if they don't upload the recall notification email or enter a sent date", () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.login()

    const assessRecallEmail = assessRecallEmailPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallEmail.confirmEmailSent()
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailFileName',
      summaryError: 'Select an email',
    })
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailSentDateTime',
      summaryError: 'Enter the date and time you sent the email',
    })
  })

  it('User sees an error if they upload an invalid format for recall notification email', () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.login()

    const assessRecallEmail = assessRecallEmailPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallEmail.confirmEmailSent()
    assessRecallEmail.enterDateTime({
      prefix: 'recallNotificationEmailSentDateTime',
      values: {
        Day: '15',
        Month: '08',
        Year: '2021',
        Hour: '14',
        Minute: '04',
      },
    })
    assessRecallEmail.uploadFile({
      fieldName: 'recallNotificationEmailFileName',
      fileName: 'part_a_recall_report.pdf',
    })
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailFileName',
      summaryError: 'The selected file must be an MSG or EML',
    })
  })

  it('User sees an error if an upload has a virus', () => {
    cy.task('expectAddRecallDocument', {
      statusCode: 400,
      responseBody: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
    })
    cy.login()

    const assessRecallEmail = assessRecallEmailPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallEmail.confirmEmailSent()
    assessRecallEmail.enterDateTime({
      prefix: 'recallNotificationEmailSentDateTime',
      values: {
        Day: '15',
        Month: '08',
        Year: '2021',
        Hour: '14',
        Minute: '04',
      },
    })
    assessRecallEmail.uploadFile({
      fieldName: 'recallNotificationEmailFileName',
      fileName: 'email.msg',
    })
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailFileName',
      summaryError: 'email.msg contains a virus',
    })
  })

  it('User sees a previously saved notification email', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'BOOKED_ON',
        documents: [
          {
            documentId: 'ea443809-4b29-445a-8c36-3ff259f48b03',
            category: 'RECALL_NOTIFICATION_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    cy.login()
    const assessRecallEmail = assessRecallEmailPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallEmail.assertElementHasText({
      qaAttr: 'uploadedDocument-RECALL_NOTIFICATION_EMAIL',
      textToFind: 'email.msg',
    })
  })

  it('user can download request email from recall info page', () => {
    cy.login()
    assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
    const fileName = 'recall-request.eml'
    cy.task('expectGetRecallDocument', {
      category: 'RECALL_REQUEST_EMAIL',
      file: 'abc',
      fileName,
      documentId: '123',
    })
    cy.get(`[data-qa="uploadedDocument-RECALL_REQUEST_EMAIL"]`).click()
    checkDownload(fileName)
  })
})
