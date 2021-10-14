import { getRecallResponse, searchResponse, getEmptyRecallResponse } from '../mockApis/mockResponses'

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
    cy.task('expectGetUserDetails', { firstName: 'Bertie', lastName: 'Badger' })
  })

  it('User can verify recall details before creating a dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
      },
    })
    cy.login()
    const dossierRecall = dossierRecallPage.verifyOnPage({ nomsNumber, recallId, personName })
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
  })

  it('User can create a dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        documents: [
          ...getRecallResponse.documents,
          {
            category: 'DOSSIER_EMAIL',
            documentId: '234-3455-8542-c3ac-8c963f66afa6',
            fileName: 'email.msg',
          },
        ],
      },
    })
    cy.task('expectAddRecallDocument', { statusCode: 201 })
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
    dossierDownload.assertLinkHref({
      qaAttr: 'getLetterLink',
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/letter-to-prison`,
    })
    dossierDownload.confirmDossierChecked()
    dossierDownload.clickContinue()
    const dossierEmail = dossierEmailPage.verifyOnPage()
    dossierEmail.confirmEmailSent()
    dossierEmail.clickTodayLink()
    dossierEmail.uploadEmail({ fieldName: 'dossierEmailFileName', fileName: 'email.msg' })
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
