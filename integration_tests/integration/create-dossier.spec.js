import path from 'path'
import { getRecallResponse, searchResponse, getEmptyRecallResponse } from '../mockApis/mockResponses'

import recallsListPage from '../pages/recallsList'

const dossierLetterPage = require('../pages/dossierLetter')
const dossierCheckPage = require('../pages/dossierCheck')
const dossierDownloadPage = require('../pages/dossierDownload')
const dossierEmailPage = require('../pages/dossierEmail')
const dossierConfirmationPage = require('../pages/dossierConfirmation')
const assessRecallPage = require('../pages/assessRecall')

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
  })

  it('User can create a dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
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
    cy.task('expectGetUserDetails', { firstName: 'Bertie', lastName: 'Badger' })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.createDossier({ recallId })
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
      href: `/persons/${nomsNumber}/recalls/${recallId}/documents/letter`,
    })
    dossierDownload.confirmDossierChecked()
    dossierDownload.clickContinue()
    const dossierEmail = dossierEmailPage.verifyOnPage()
    dossierEmail.confirmEmailSent()
    dossierEmail.enterDateTime({
      prefix: 'dossierEmailSentDate',
      values: {
        Day: '8',
        Month: '9',
        Year: '2021',
      },
    })
    dossierEmail.uploadEmail('email.msg')
    dossierEmail.clickContinue()
    dossierConfirmationPage.verifyOnPage()
    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
    assessRecall.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'Yes' })
    assessRecall.assertElementHasText({ qaAttr: 'additionalLicenceConditionsDetail', textToFind: 'one, two' })
    assessRecall.assertElementHasText({ qaAttr: 'differentNomsNumber', textToFind: 'Yes' })
    assessRecall.assertElementHasText({ qaAttr: 'differentNomsNumberDetail', textToFind: 'AC3408303' })
    assessRecall.assertElementHasText({
      qaAttr: 'dossierEmailSentDate',
      textToFind: '8 September 2021',
    })
    assessRecall.assertElementHasText({ qaAttr: 'hasDossierBeenChecked', textToFind: 'Yes' })
    assessRecall.assertElementHasText({ qaAttr: 'dossierEmailSentDate', textToFind: '8 September 2021' })
    assessRecall.assertElementHasText({ qaAttr: 'dossierCreatedByUserName', textToFind: 'Bertie Badger' })
    cy.get(`[data-qa="uploadedDocument-DOSSIER_EMAIL"]`).click()
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
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
      summaryError: 'Have the dossier and letter been checked?',
      fieldError: "Confirm you've checked the dossier and letter",
    })
  })
})
