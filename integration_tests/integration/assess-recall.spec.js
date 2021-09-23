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
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.task('expectGetUserDetails', { firstName: 'Bertie', lastName: 'Badger' })
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'BOOKED_ON'

  it('User can assess and issue a recall', () => {
    const fileName = '2021-07-03 Phil Jones recall.msg'
    cy.task('expectGetRecallDocument', {
      category: 'RECALL_NOTIFICATION_EMAIL',
      file: 'abc',
      fileName,
      documentId: '123',
    })
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
    assessRecallEmail.uploadEmail('email.msg')
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
    assessRecall.assertElementHasText({ qaAttr: 'currentPrison', textToFind: 'Kennet (HMP)' })
    assessRecall.assertElementHasText({
      qaAttr: 'recallNotificationEmailSentDateTime',
      textToFind: '15 August 2021 at 2:04pm',
    })
    assessRecall.assertElementHasText({ qaAttr: 'assessedByUserName', textToFind: 'Bertie Badger' })
    cy.get(`[data-qa="uploadedDocument-RECALL_NOTIFICATION_EMAIL"]`).click()
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
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
      fieldError: 'Select one',
    })
    assessRecallDecision.makeYesDecision()
    assessRecallDecision.clickContinue()
    assessRecallDecision.assertErrorMessage({
      fieldName: 'agreeWithRecallDetailYes',
      summaryError: 'Provide detail on your decision',
      fieldError: 'Provide more detail',
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
      summaryError: 'Breached licence conditions',
      fieldError: 'Enter the licence conditions breached',
    })
    assessRecallLicence.assertErrorMessage({
      fieldName: 'reasonsForRecall',
      summaryError: 'Reasons for recall',
      fieldError: 'Please select at least one reason for recall',
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
      fieldError: 'Please select a prison',
    })
  })

  it("User sees an error if they don't upload the recall notification email", () => {
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
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailFileName',
      summaryError: 'Upload the email',
      fieldError: 'Upload the email',
    })
  })

  it("User sees an error if they don't enter the recall notification email sent date", () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.login()

    const assessRecallEmail = assessRecallEmailPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallEmail.confirmEmailSent()
    assessRecallEmail.uploadEmail('email.msg')
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailSentDateTime',
      summaryError: 'Date and time you sent the recall email',
      fieldError: 'Enter a valid date and time in the past',
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
    assessRecallEmail.uploadEmail('part_a_recall_report.pdf')
    assessRecallEmail.clickContinue()
    assessRecallEmail.assertErrorMessage({
      fieldName: 'recallNotificationEmailFileName',
      summaryError: 'Only .msg files are allowed',
      fieldError: 'Only .msg files are allowed',
    })
  })
})
