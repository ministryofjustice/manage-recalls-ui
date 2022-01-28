import { getRecallResponse, getEmptyRecallResponse } from '../mockApis/mockResponses'
import { stubRefData } from '../support/mock-api'
import { getIsoDateForMinutesAgo } from '../support/utils'

const assessRecallPage = require('../pages/assessRecall')
const assessRecallDecisionPage = require('../pages/assessRecallDecision')
const assessRecallPrisonPage = require('../pages/assessRecallPrison')
const assessRecallLicencePage = require('../pages/assessRecallLicence')
const assessRecallEmailPage = require('../pages/assessRecallEmail')
const assessRecallStopPage = require('../pages/assessRecallStop')

context('Assess a recall', () => {
  const recall = getRecallResponse
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const firstName = 'Bobby'
  const lastName = 'Badger'
  const firstLastName = `${firstName} ${lastName}`
  const status = 'BOOKED_ON'
  const fullRecall = {
    ...recall,
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
    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: firstLastName })
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
          firstName,
          lastName,
        },
      ],
    })
    cy.task('expectGetRecall', {
      expectedResult: fullRecall,
    })
    stubRefData()
    cy.task('expectAssignUserToRecall', { expectedResult: recall })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.visitPage('/')
    cy.clickButton('Assess recall')
    cy.pageHeading('Assess a recall for Bobby Badger')
    cy.clickLink('Assess recall')

    cy.selectRadio('Do you agree with the fixed term 14 day recall recommendation?', 'Yes')
    cy.fillInput('Provide more detail', 'No evidence that the recommendation was wrong')
    cy.clickButton('Continue')

    cy.pageHeading('How has the licence been breached?')
    cy.fillInput('Licence conditions breached', recall.licenceConditionsBreached)
    cy.selectCheckboxes('Reasons for recall', recall.reasonsForRecall, { findByValue: true })
    cy.fillInput('Provide more detail', recall.reasonsForRecallOtherDetail)
    cy.clickButton('Continue')

    cy.selectFromAutocomplete(`Which prison is ${firstLastName} in?`, 'Kenn')
    cy.clickButton('Continue')

    cy.pageHeading('Download recall notification')
    cy.clickLink('Recall notification')
    cy.getText('getRecallNotificationFileName').should(
      'contain',
      'Filename: IN CUSTODY RECALL BADGER BOBBY A123456.pdf'
    )
    cy.clickLink('Continue')

    cy.selectCheckboxes('I have sent the email to all recipients', ['I have sent the email to all recipients'])
    const fiveMinutesAgo = getIsoDateForMinutesAgo(5)
    cy.enterDateTime(fiveMinutesAgo)
    cy.uploadEmail({ field: 'recallNotificationEmailFileName', file: 'email.msg' })
    cy.clickButton('Complete assessment')

    cy.pageHeading(`Recall assessed for ${firstLastName}`)
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
    const assessRecallStop = assessRecallStopPage.verifyOnPage({ firstLastName })
    assessRecallStop.assertElementHasText({ qaAttr: 'managerName', textToFind: '[name]' })
    assessRecallStop.assertElementHasText({ qaAttr: 'managerPhone', textToFind: '[phone]' })
  })

  it('licence details', () => {
    // errors if fields not completed
    cy.task('expectGetRecall', { expectedResult: emptyRecall })
    cy.task('expectUpdateRecall', recallId)
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'assess-licence' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'licenceConditionsBreached',
      summaryError: 'Enter the licence conditions breached',
    })
    cy.assertErrorMessage({
      fieldName: 'reasonsForRecall',
      summaryError: 'Select reasons for recall',
    })

    // reset detail to empty string if user doesn't select Other reason, and there is existing detail for it
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        licenceConditionsBreached: 'Some',
        reasonsForRecall: ['OTHER'],
        reasonsForRecallOtherDetail: 'Detail',
      },
    })
    cy.reload()
    cy.selectCheckboxes('Reasons for recall', ['TRAVELLING_OUTSIDE_UK'], { findByValue: true })
    // de-select Other checkbox
    cy.contains('label', 'Other').click()
    cy.clickButton('Continue')
    cy.assertRecallFieldsSavedToApi({
      recallId,
      bodyValues: {
        reasonsForRecall: ['TRAVELLING_OUTSIDE_UK'],
        reasonsForRecallOtherDetail: '',
      },
    })
  })

  it('errors - current prison', () => {
    cy.task('expectGetRecall', { expectedResult: emptyRecall })
    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ nomsNumber, recallId, firstLastName })
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
        ...recall,
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
