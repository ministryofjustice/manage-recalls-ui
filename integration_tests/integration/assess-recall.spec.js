import { getRecallResponse, getEmptyRecallResponse } from '../mockApis/mockResponses'
import recallsListPage from '../pages/recallsList'
import { stubRefData } from '../support/mock-api'

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
  const fullRecall = {
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
  }
  const emptyRecall = { ...getEmptyRecallResponse, recallId }

  beforeEach(() => {
    cy.login()
  })

  it('User can view recall information before assessing', () => {
    cy.task('expectGetRecall', {
      expectedResult: fullRecall,
    })
    stubRefData()
    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
    assessRecall.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Booking complete' })
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
    assessRecall.assertElementHasText({
      qaAttr: 'inCustody',
      textToFind: 'Not in custody',
    })
    assessRecall.assertElementNotPresent({ qaAttr: 'inCustodyChange' })

    // change link for an uploaded document goes to the 'add new document version' page
    assessRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/persons/A1234AA/recalls/123/upload-document-version?fromPage=assess&fromHash=uploaded-documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })

    // missing documents
    assessRecall.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    assessRecall.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
  })

  it('can assess a recall', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
        },
      ],
    })
    cy.task('expectGetRecall', {
      expectedResult: fullRecall,
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.visitPage('/')
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
    assessRecallDownload.assertLinkHref({
      qaAttr: 'getRecallNotificationLink',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/create?category=RECALL_NOTIFICATION`,
    })
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

  it('errors - recall recommendation', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...emptyRecall, recallLength: 'FOURTEEN_DAYS' },
    })
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallDecision.clickContinue()
    assessRecallDecision.assertErrorMessage({
      fieldName: 'agreeWithRecall',
      summaryError: 'Do you agree with the recall recommendation?',
    })

    // if they don't add detail on their decision
    assessRecallDecision.makeYesDecision()
    assessRecallDecision.clickContinue()
    assessRecallDecision.assertErrorMessage({
      fieldName: 'agreeWithRecallDetailYes',
      summaryError: 'Provide more detail',
    })
  })

  it('can stop a recall', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...emptyRecall, recallLength: 'FOURTEEN_DAYS' },
    })
    cy.task('expectUpdateRecall', recallId)
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallDecision.makeNoDecision()
    assessRecallDecision.addNoDetail()
    assessRecallDecision.clickContinue()
    const assessRecallStop = assessRecallStopPage.verifyOnPage({ personName })
    assessRecallStop.assertElementHasText({ qaAttr: 'managerName', textToFind: '[name]' })
    assessRecallStop.assertElementHasText({ qaAttr: 'managerPhone', textToFind: '[phone]' })
  })

  it('errors - licence details', () => {
    cy.task('expectGetRecall', { expectedResult: emptyRecall })
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

  it('errors - current prison', () => {
    cy.task('expectGetRecall', { expectedResult: emptyRecall })
    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ nomsNumber, recallId, personName })
    assessRecallPrison.clickContinue()
    assessRecallPrison.assertErrorMessage({
      fieldName: 'currentPrison',
      summaryError: 'Select a prison',
    })
    // invalid input for current prison
    cy.get('[id="currentPrison"]').clear().type('blah blah blah')
    assessRecallPrison.clickContinue()
    assessRecallPrison.assertSelectValue({ fieldName: 'currentPrisonInput', value: 'blah blah blah' })
    assessRecallPrison.assertErrorMessage({
      fieldName: 'currentPrison',
      summaryError: 'Select a prison from the list',
    })
  })

  it("User sees an error if they don't upload the recall notification email or enter a sent date", () => {
    cy.task('expectGetRecall', { expectedResult: emptyRecall })
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
    // upload an invalid format for recall notification email
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
    // upload has a virus
    cy.task('expectUploadRecallDocument', {
      statusCode: 400,
      responseBody: { status: 'BAD_REQUEST', message: 'VirusFoundException' },
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
    const assessRecallEmail = assessRecallEmailPage.verifyOnPage({ nomsNumber, recallId })
    assessRecallEmail.assertElementHasText({
      qaAttr: 'uploadedDocument-RECALL_NOTIFICATION_EMAIL',
      textToFind: 'email.msg',
    })
  })
})
