import { getRecallResponse, getEmptyRecallResponse } from '../mockApis/mockResponses'

import recallsListPage from '../pages/recallsList'
import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'
import { stubRefData } from '../support/mock-api'

const dossierLetterPage = require('../pages/dossierLetter')
const dossierCheckPage = require('../pages/dossierCheck')
const dossierEmailPage = require('../pages/dossierEmail')
const dossierConfirmationPage = require('../pages/dossierConfirmation')
const dossierRecallPage = require('../pages/dossierRecallInformation')

context('Primary dossier', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'AWAITING_DOSSIER_CREATION'
  const emptyRecall = { ...getEmptyRecallResponse, recallId }

  beforeEach(() => {
    cy.login()
  })

  it('can verify recall details before creating a dossier', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
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
            category: 'REVOCATION_ORDER',
            documentId: '9876',
            fileName: 'BADGER BOBBY A123456 REVOCATION ORDER.pdf',
          },
          {
            category: 'RECALL_NOTIFICATION_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'notification.msg',
            createdDateTime: '2020-12-05T18:33:57.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'recall-request.eml',
            createdDateTime: '2020-12-05T18:33:57.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
        ],
        missingDocuments: {
          required: ['LICENCE'],
          desired: ['OASYS_RISK_ASSESSMENT'],
        },
        returnedToCustodyDateTime: undefined,
        returnedToCustodyNotificationDateTime: undefined,
      },
    })
    const dossierRecall = dossierRecallPage.verifyOnPage({ recallId, personName })

    dossierRecall.assertElementHasText({ qaAttr: 'dossierTargetDate', textToFind: 'Overdue: Due on 14 December 2020' })

    dossierRecall.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Assessment complete' })
    dossierRecall.assertElementHasText({ qaAttr: 'bookingNumber', textToFind: 'A123456' })
    dossierRecall.assertElementHasText({ qaAttr: 'assessedByUserName', textToFind: 'Bertie Badger' })

    // custody details
    dossierRecall.assertElementHasText({
      qaAttr: 'inCustodyAtBooking',
      textToFind: 'Not in custody',
    })
    dossierRecall.assertElementHasText({
      qaAttr: 'inCustodyAtAssessment',
      textToFind: 'In custody',
    })
    dossierRecall.assertElementHasText({ qaAttr: 'currentPrison', textToFind: 'Kennet (HMP)' })
    cy.getElement('Change custody status at booking').should('not.exist')
    cy.getElement('Change custody status at assessment').should('not.exist')

    // recall details
    cy.recallInfo('Recall email received').should('equal', '5 December 2020 at 15:33')
    cy.recallInfo('Recall email uploaded').should('equal', 'recall-request.eml')
    dossierRecall.assertElementHasText({ qaAttr: 'licenceConditionsBreached', textToFind: '(i) one (ii) two' })
    cy.getLinkHref('Change licence conditions breached').should('contain', '/assess-licence')
    cy.getLinkHref('Change reasons for recall').should('contain', '/assess-licence')
    dossierRecall.assertElementHasText({
      qaAttr: 'reasonsForRecall-ELM_FAILURE_CHARGE_BATTERY',
      textToFind: 'Electronic locking and monitoring (ELM) - Failure to charge battery',
    })
    dossierRecall.assertElementHasText({
      qaAttr: 'reasonsForRecall-OTHER',
      textToFind: 'Other - other reason detail...',
    })
    cy.recallInfo('Recall notification email sent').should('equal', '15 August 2021 at 14:04')
    cy.recallInfo('Recall notification email uploaded').should('equal', 'notification.msg')
    cy.getLinkHref('Change recall notification email sent date').should('contain', '/assess-email')
    cy.getLinkHref('Change uploaded recall notification email').should('contain', '/assess-email')

    // revocation order
    cy.getLinkHref('BADGER BOBBY A123456 REVOCATION ORDER.pdf').should('contain', `/recalls/${recallId}/documents/9876`)
    cy.getLinkHref('Change Revocation order').should(
      'contain',
      '/generated-document-version?fromPage=dossier-recall&fromHash=revocation-order&versionedCategoryName=REVOCATION_ORDER'
    )

    // uploaded documents
    dossierRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      href: `/recalls/${recallId}/documents/123`,
    })
    dossierRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
      href: `/recalls/${recallId}/documents/1234-5717-4562-b3fc-2c963f66afa6`,
    })

    // change link for an uploaded document goes to the 'add new document version' page
    dossierRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/recalls/123/upload-document-version?fromPage=dossier-recall&fromHash=uploaded-documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })
    // missing documents
    dossierRecall.assertElementHasText({ qaAttr: 'required-LICENCE', textToFind: 'Missing: needed to create dossier' })
    dossierRecall.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
    // disabled Create dossier button
    dossierRecall.assertElementHasText({ qaAttr: 'createDossierDisabled', textToFind: 'Create dossier' })
  })

  it('can verify recall details before creating a dossier (not in custody)', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        documents: [],
        returnedToCustodyDateTime: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-recall' })
    cy.getText('inCustodyAtBooking').should('equal', 'Not in custody')
    cy.getText('inCustodyAtAssessment').should('equal', 'Not in custody')
    cy.getElement({ qaAttr: 'currentPrison' }).should('not.exist')
  })

  it('can create a dossier', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        hasDossierBeenChecked: undefined,
        recallId,
        status,
        returnedToCustodyDateTime: undefined,
        returnedToCustodyNotificationDateTime: undefined,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
          },
          {
            category: 'LICENCE',
            documentId: '123',
          },
        ],
      },
    })
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    const fileName = 'email.msg'
    cy.task('expectGetRecallDocument', {
      category: 'DOSSIER_EMAIL',
      file: 'abc',
      fileName,
      documentId: '123',
    })
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
          inCustodyAtBooking: true,
        },
      ],
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectUpdateRecall', { recallId, status })
    cy.task('expectAddPhaseStartTime')
    cy.task('expectAddPhaseEndTime')

    cy.visit('/')
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.createDossier({ recallId })
    const dossierRecall = dossierRecallPage.verifyOnPage({ personName })
    dossierRecall.assertElementHasText({
      qaAttr: 'revocationOrderNotAvailable',
      textToFind: 'Not available',
    })
    dossierRecall.clickContinue()
    const dossierLetter = dossierLetterPage.verifyOnPage()
    dossierLetter.additionalLicenceConditions()
    dossierLetter.addLicenceDetail()
    dossierLetter.differentNomsNumber()
    dossierLetter.addNomsDetail()
    dossierLetter.clickContinue()
    const dossierCheck = dossierCheckPage.verifyOnPage()
    dossierCheck.assertElementHasText({ qaAttr: 'name', textToFind: 'Bobby Badger' })
    dossierCheck.assertElementHasText({ qaAttr: 'nomsNumber', textToFind: 'A1234AA' })
    dossierCheck.assertElementHasText({ qaAttr: 'bookingNumber', textToFind: 'A123456' })
    dossierCheck.assertElementHasText({ qaAttr: 'licenceConditionsBreached', textToFind: '(i) one (ii) two' })
    dossierCheck.assertElementHasText({ qaAttr: 'recallLength', textToFind: '14 days' })
    dossierCheck.clickContinue()

    cy.pageHeading().should('equal', 'Download the dossier and letter')
    cy.getLinkHref('Download the Dossier').should(
      'contain',
      `/recalls/${recallId}/documents/create?category=DOSSIER&pageSuffix=dossier-download`
    )
    cy.getText('getDossierFileName').should('equal', 'Filename: BADGER BOBBY A123456 RECALL DOSSIER.pdf')
    cy.getLinkHref('Download the Letter to prison').should(
      'contain',
      `/recalls/${recallId}/documents/create?category=LETTER_TO_PRISON&pageSuffix=dossier-download`
    )
    cy.getText('getLetterToPrisonFileName').should('equal', 'Filename: BADGER BOBBY A123456 LETTER TO PRISON.pdf')
    cy.selectConfirmationCheckbox('I have checked the information in the dossier and letter is correct')
    cy.clickButton('Continue')

    const dossierEmail = dossierEmailPage.verifyOnPage()
    dossierEmail.confirmEmailSent()
    dossierEmail.clickTodayLink()
    dossierEmail.uploadFile({ fieldName: 'dossierEmailFileName', fileName: 'email.msg' })
    dossierEmail.clickContinue()
    dossierConfirmationPage.verifyOnPage()
  })

  it('asks for current prison then NSY email confirmation, if the person has returned to custody', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        currentPrison: undefined,
      },
    })
    cy.task('expectUpdateRecall', { recallId, status })
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-recall' })
    cy.clickLink('Create dossier')
    cy.pageHeading().should('equal', `Which prison is ${personName} in?`)
    cy.selectFromAutocomplete(`Which prison is ${personName} in?`, 'Kenn')
    // reset the stub so it includes current prison, ready for the next page render
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
      },
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Email New Scotland Yard')
    cy.getLinkHref('Email New Scotland Yard', { parent: 'form' }).should(
      'contain',
      'mailto:test@domain.com?subject=RTC%20-%20Bobby%20Badger%20-%20A123456&body=Please%20note%20that%20Bobby%20Badger%20-%2028%20May%201999%2C%20CRO%20-%201234%2F56A%2C%20Booking%20number%20-%20A123456%20-%20was%20returned%20to%20Kennet%20(HMP)%20on%2022%20January%202022%20at%2013%3A45.%20Please%20remove%20them%20from%20the%20PNC%20if%20this%20has%20not%20already%20been%20done.'
    )
    cy.selectCheckboxes('I have sent the email', ['I have sent the email'])
    cy.uploadEmail({ field: 'nsyEmailFileName' })
    cy.clickButton('Continue')
    cy.getLinkHref('Back').should('contain', '/dossier-nsy-email')
    // NSY email visible on recall info page
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        documents: [
          {
            category: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
            documentId: '639',
            fileName: 'nsy.msg',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-04-01T12:00:00.000Z',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('NSY email uploaded').should('contain', 'nsy.msg')
  })

  it('errors - email New Scotland Yard', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: emptyRecall,
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-nsy-email' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'confirmNsyEmailSent',
      summaryError: "Confirm you've sent the email to all recipients",
    })

    // confirm sending but don't enter a send date or upload an email
    cy.selectCheckboxes('I have sent the email', ['I have sent the email'])
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'nsyEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('errors - user did not confirm check', () => {
    cy.task('expectGetRecall', {
      expectedResult: emptyRecall,
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-download' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'hasDossierBeenChecked',
      summaryError: "Confirm you've checked the information in the dossier and letter",
    })
  })

  it('error - download document fails', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, hasDossierBeenChecked: undefined },
    })
    stubRefData()
    cy.task('expectGetRecallDocumentHistory', { expectedResult: [] })
    cy.task('expectGenerateRecallDocument', { statusCode: 500 })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-download' })
    cy.downloadFile('Download the Dossier', { allowPageReload: true })
    cy.get(`[href="#error_DOSSIER"]`).should(
      'have.text',
      'An error occurred when creating the dossier. Please try downloading it again'
    )
    cy.downloadFile('Download the Letter to probation', { allowPageReload: true })
    cy.get(`[href="#error_LETTER_TO_PROBATION"]`).should(
      'have.text',
      'An error occurred when creating the letter to probation. Please try downloading it again'
    )
    cy.downloadFile('Download the Letter to prison', { allowPageReload: true })
    cy.get(`[href="#error_LETTER_TO_PRISON"]`).should(
      'have.text',
      'An error occurred when creating the letter to prison. Please try downloading it again'
    )
    cy.getElement('Continue').should('be.disabled')
  })

  it('errors - email the dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: emptyRecall,
    })
    const dossierEmail = dossierEmailPage.verifyOnPage({ recallId })
    dossierEmail.clickContinue()
    dossierEmail.assertErrorMessage({
      fieldName: 'confirmDossierEmailSent',
      summaryError: "Confirm you've sent the email to all recipients",
    })

    // confirm sending but don't enter a send date or upload an email
    dossierEmail.confirmEmailSent()
    dossierEmail.clickContinue()
    cy.assertErrorMessage({
      fieldId: 'dossierEmailSentDate-dossierEmailSentDateDay',
      fieldName: 'dossierEmailSentDate',
      summaryError: 'Enter the date you sent the email',
    })
    dossierEmail.assertErrorMessage({
      fieldName: 'dossierEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('previously saved dossier email', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            documentId: 'ea443809-4b29-445a-8c36-3ff259f48b03',
            category: 'DOSSIER_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    const dossierEmail = dossierEmailPage.verifyOnPage({ recallId })
    dossierEmail.assertElementHasText({ qaAttr: 'uploadedDocument-DOSSIER_EMAIL', textToFind: 'email.msg' })
  })

  it('letter page', () => {
    const nomisQuestion = `Is ${personName} being held under a different NOMIS number to the one on the licence?`
    // errors for missing fields
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.task('expectUpdateRecall', { recallId })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-letter' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'additionalLicenceConditions',
      summaryError: 'Are there additional licence conditions?',
    })
    cy.assertErrorMessage({
      fieldName: 'differentNomsNumber',
      summaryError: nomisQuestion,
    })

    // invalid NOMIS
    cy.selectRadio('Are there additional licence conditions?', 'No')
    cy.selectRadio(nomisQuestion, 'Yes')
    cy.fillInput(`NOMIS number ${personName} is being held under`, '123', {
      parent: '#conditional-differentNomsNumber',
    })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'differentNomsNumberDetail',
      summaryError: 'Enter a NOMIS number in the correct format',
    })

    // reset detail to empty string if user doesn't select Other reason, and there is existing detail for it
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        additionalLicenceConditions: true,
        additionalLicenceConditionsDetail: 'one, two',
        differentNomsNumber: true,
        differentNomsNumberDetail: 'AC3408303',
      },
    })
    cy.reload()
    cy.selectRadio('Are there additional licence conditions?', 'No')
    cy.selectRadio(nomisQuestion, 'No')
    cy.clickButton('Continue')
    cy.assertRecallFieldsSavedToApi({
      recallId,
      bodyValues: {
        additionalLicenceConditions: false,
        additionalLicenceConditionsDetail: '',
        differentNomsNumber: false,
        differentNomsNumberDetail: '',
      },
    })
  })

  it('makes letter to probation available to download for a not in custody recall', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        bookingNumber: 'A123456',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        returnedToCustodyDateTime: '2022-01-22T13:45:33.000Z',
        returnedToCustodyNotificationDateTime: '2022-01-23T08:22:06.000Z',
        recallId,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-download' })
    cy.pageHeading().should('equal', 'Download the dossier and letters')
    cy.getLinkHref({
      qaAttr: 'getLetterToProbationLink',
    }).should('contain', `/recalls/${recallId}/documents/create?category=LETTER_TO_PROBATION`)
    cy.getText('getLetterToProbationFileName').should('equal', 'Filename: BADGER BOBBY A123456 LETTER TO PROBATION.pdf')
  })
})