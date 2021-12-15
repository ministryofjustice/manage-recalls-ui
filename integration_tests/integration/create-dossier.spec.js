import {
  getRecallResponse,
  searchResponse,
  getEmptyRecallResponse,
  getLocalDeliveryUnitsResponse,
  getPrisonsResponse,
  getCourtsResponse,
} from '../mockApis/mockResponses'

import recallsListPage from '../pages/recallsList'

const dossierLetterPage = require('../pages/dossierLetter')
const dossierCheckPage = require('../pages/dossierCheck')
const dossierDownloadPage = require('../pages/dossierDownload')
const dossierEmailPage = require('../pages/dossierEmail')
const dossierConfirmationPage = require('../pages/dossierConfirmation')
const dossierRecallPage = require('../pages/dossierRecallInformation')

context('Create a dossier', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'RECALL_NOTIFICATION_ISSUED'

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
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
  })

  it('User can verify recall details before creating a dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
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
          },
        ],
      },
    })
    cy.login()
    const dossierRecall = dossierRecallPage.verifyOnPage({ nomsNumber, recallId, personName })

    dossierRecall.assertElementHasText({ qaAttr: 'recallStatus', textToFind: 'Recall notification issued' })
    dossierRecall.assertElementHasText({ qaAttr: 'dossierTargetDate', textToFind: 'Overdue: Due on 14 December 2020' })
    dossierRecall.assertElementHasText({ qaAttr: 'bookingNumber', textToFind: 'A123456' })
    dossierRecall.assertElementHasText({ qaAttr: 'assessedByUserName', textToFind: 'Bertie Badger' })
    dossierRecall.assertElementHasText({ qaAttr: 'agreeWithRecallDetail', textToFind: 'Reasons...' })
    dossierRecall.assertElementHasText({ qaAttr: 'licenceConditionsBreached', textToFind: '(i) one (ii) two' })
    dossierRecall.assertElementHasText({
      qaAttr: 'reasonsForRecall-ELM_FAILURE_CHARGE_BATTERY',
      textToFind: 'Electronic locking and monitoring (ELM) - Failure to charge battery',
    })
    dossierRecall.assertElementHasText({
      qaAttr: 'reasonsForRecall-OTHER',
      textToFind: 'Other - other reason detail...',
    })
    dossierRecall.assertElementHasText({ qaAttr: 'currentPrison', textToFind: 'Kennet (HMP)' })
    dossierRecall.assertElementNotPresent({ qaAttr: 'recallNotificationEmailSentDateTime' })
    // uploaded documents
    dossierRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/123`,
    })
    dossierRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/1234-5717-4562-b3fc-2c963f66afa6`,
    })
    dossierRecall.assertLinkHref({
      qaAttr: 'generatedDocument-REVOCATION_ORDER',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/revocation-order/9876`,
    })

    // change link for an uploaded document goes to the 'add new document version' page
    dossierRecall.assertLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change',
      href: '/persons/A1234AA/recalls/123/upload-document-version?fromPage=dossier-recall&fromHash=documents&versionedCategoryName=PART_A_RECALL_REPORT',
    })
    // missing documents
    dossierRecall.assertElementHasText({ qaAttr: 'required-LICENCE', textToFind: 'Missing: needed to create dossier' })
    dossierRecall.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
    // disabled Create dossier button
    dossierRecall.assertElementHasText({ qaAttr: 'createDossierDisabled', textToFind: 'Create dossier' })
  })

  it('User can create a dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
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
    cy.login()
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
    const dossierDownload = dossierDownloadPage.verifyOnPage()
    dossierDownload.assertLinkHref({
      qaAttr: 'getDossierLink',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/dossier`,
    })
    dossierDownload.assertElementHasText({
      qaAttr: 'getDossierFileName',
      textToFind: 'Filename: BADGER BOBBY A123456 RECALL DOSSIER.pdf',
    })
    dossierDownload.assertLinkHref({
      qaAttr: 'getLetterLink',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/letter-to-prison`,
    })
    dossierDownload.assertElementHasText({
      qaAttr: 'getLetterFileName',
      textToFind: 'Filename: BADGER BOBBY A123456 LETTER TO PRISON.pdf',
    })
    dossierDownload.confirmDossierChecked()
    dossierDownload.clickContinue()
    const dossierEmail = dossierEmailPage.verifyOnPage()
    dossierEmail.confirmEmailSent()
    dossierEmail.clickTodayLink()
    dossierEmail.uploadFile({ fieldName: 'dossierEmailFileName', fileName: 'email.msg' })
    dossierEmail.clickContinue()
    dossierConfirmationPage.verifyOnPage()
  })

  it("User sees an error if they don't confirm the dossier was checked", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.login()
    const dossierDownload = dossierDownloadPage.verifyOnPage({ nomsNumber, recallId })
    dossierDownload.clickContinue()
    dossierDownload.assertErrorMessage({
      fieldName: 'hasDossierBeenChecked',
      summaryError: "Confirm you've checked the information in the dossier and letter",
    })
  })

  it("User sees an error if they don't confirm sending the dossier", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.login()
    const dossierEmail = dossierEmailPage.verifyOnPage({ nomsNumber, recallId })
    dossierEmail.clickContinue()
    dossierEmail.assertErrorMessage({
      fieldName: 'confirmDossierEmailSent',
      summaryError: "Confirm you've sent the email to all recipients",
    })
  })

  it("User sees an error if they confirm sending but don't enter a send date or upload an email", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.login()
    const dossierEmail = dossierEmailPage.verifyOnPage({ nomsNumber, recallId })
    dossierEmail.confirmEmailSent()
    dossierEmail.clickContinue()
    dossierEmail.assertErrorMessage({
      fieldName: 'dossierEmailSentDate',
      summaryError: 'Enter the date you sent the email',
    })
    dossierEmail.assertErrorMessage({
      fieldName: 'dossierEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('User sees a previously saved dossier email', () => {
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
    cy.login()
    const dossierEmail = dossierEmailPage.verifyOnPage({ nomsNumber, recallId })
    dossierEmail.assertElementHasText({ qaAttr: 'uploadedDocument-DOSSIER_EMAIL', textToFind: 'email.msg' })
  })

  it("User sees errors if they don't enter info on the letter page", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.login()
    const dossierLetter = dossierLetterPage.verifyOnPage({ nomsNumber, recallId })
    dossierLetter.clickContinue()
    dossierLetter.assertErrorMessage({
      fieldName: 'additionalLicenceConditions',
      summaryError: 'Are there additional licence conditions?',
    })
    dossierLetter.assertErrorMessage({
      fieldName: 'differentNomsNumber',
      summaryError: 'Is Bobby Badger being held under a different NOMIS number to the one on the licence?',
    })
  })

  it("User sees an error if they don't enter a valid NOMIS on the letter page", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.login()
    const dossierLetter = dossierLetterPage.verifyOnPage({ nomsNumber, recallId })
    dossierLetter.additionalLicenceConditions()
    dossierLetter.addLicenceDetail()
    dossierLetter.differentNomsNumber()
    dossierLetter.addNomsDetail('123')
    dossierLetter.clickContinue()
    dossierLetter.assertErrorMessage({
      fieldName: 'differentNomsNumberDetail',
      summaryError: 'Enter a NOMIS number in the correct format',
    })
  })
})
