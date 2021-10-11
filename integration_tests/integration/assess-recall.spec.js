import path from 'path'
import { getRecallResponse, searchResponse, getPrisonList, getEmptyRecallResponse } from '../mockApis/mockResponses'

const assessRecallPage = require('../pages/assessRecall')
const assessRecallDecisionPage = require('../pages/assessRecallDecision')
const assessRecallPrisonPage = require('../pages/assessRecallPrison')
const assessRecallConfirmationPage = require('../pages/assessRecallConfirmation')
const assessRecallLicencePage = require('../pages/assessRecallLicence')
const assessRecallDownloadPage = require('../pages/assessRecallDownload')
const assessRecallEmailPage = require('../pages/assessRecallEmail')
const assessRecallStopPage = require('../pages/assessRecallStop')

context('Assess a recall', () => {
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
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, recallId } })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectPrisonList', { expectedResults: getPrisonList })
    cy.task('expectPrison', { prisonId: getRecallResponse.currentPrison, expectedResults: getPrisonList[0] })
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.task('expectGetUserDetails', { firstName: 'Bertie', lastName: 'Badger' })
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'BOOKED_ON'

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

  it('User can assess and issue a recall', () => {
    cy.login()
    let assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
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
    assessRecallDownload.clickContinue()
    const assessRecallEmail = assessRecallEmailPage.verifyOnPage()
    assessRecallEmail.confirmEmailSent()
    assessRecallEmail.clickTodayLink()
    assessRecallEmail.enterDateTime({
      prefix: 'recallNotificationEmailSentDateTime',
      values: {
        Hour: '0',
        Minute: '0',
      },
    })
    assessRecallEmail.uploadEmail({ fieldName: 'recallNotificationEmailFileName', fileName: 'email.msg' })
    assessRecallEmail.clickContinue()
    assessRecallConfirmationPage.verifyOnPage({ fullName: personName })
    assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
    assessRecall.assertElementHasText({ qaAttr: 'agreeWithRecall', textToFind: 'Yes' })
    assessRecall.assertElementHasText({ qaAttr: 'agreeWithRecallDetail', textToFind: 'Reasons...' })
    assessRecall.assertElementHasText({ qaAttr: 'licenceConditionsBreached', textToFind: '(i) one (ii) two' })
    assessRecall.assertElementHasText({
      qaAttr: 'reasonsForRecall-ELM_FAILURE_CHARGE_BATTERY',
      textToFind: 'Electronic locking and monitoring (ELM) - Failure to charge battery',
    })
    assessRecall.assertElementHasText({ qaAttr: 'reasonsForRecall-OTHER', textToFind: 'Other' })
    assessRecall.assertElementHasText({ qaAttr: 'reasonsForRecallOtherDetail', textToFind: 'other reason detail...' })
    assessRecall.assertElementHasText({ qaAttr: 'currentPrison', textToFind: 'Albany (HMP)' })
    assessRecall.assertElementHasText({
      qaAttr: 'recallNotificationEmailSentDateTime',
      textToFind: '15 August 2021 at 14:04',
    })
    assessRecall.assertElementHasText({ qaAttr: 'assessedByUserName', textToFind: 'Bertie Badger' })

    let fileName = 'recall-request.eml'
    mockFileDownload({ fileName, docCategory: 'RECALL_REQUEST_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-RECALL_REQUEST_EMAIL"]`).click()
    checkDownload(fileName)

    fileName = '2021-07-03 Phil Jones recall.msg'
    mockFileDownload({ fileName, docCategory: 'RECALL_NOTIFICATION_EMAIL' })
    cy.get(`[data-qa="uploadedDocument-RECALL_NOTIFICATION_EMAIL"]`).click()
    checkDownload(fileName)
  })

  it("User sees an error if they don't make a decision", () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
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
    cy.task('expectPrisonList', { expectedResults: getPrisonList })
    cy.login()

    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ nomsNumber, recallId, personName })
    assessRecallPrison.clickContinue()
    assessRecallPrison.assertErrorMessage({
      fieldName: 'currentPrison',
      summaryError: 'Select a prison',
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
    assessRecallEmail.uploadEmail({
      fieldName: 'recallNotificationEmailFileName',
      fileName: 'part_a_recall_report.pdf',
    })
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailFileName',
      summaryError: 'The selected file must be an MSG or EML',
    })
  })
})
