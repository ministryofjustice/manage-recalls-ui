import { getRecallResponse, searchResponse, getPrisonList, getEmptyRecallResponse } from '../mockApis/mockResponses'

import validateBinaryFile from './file-utils'
import recallsListPage from '../pages/recallsList'

const assessRecallPage = require('../pages/assessRecall')
const assessRecallDecisionPage = require('../pages/assessRecallDecision')
const assessRecallPrisonPage = require('../pages/assessRecallPrison')
const assessRecallConfirmationPage = require('../pages/assessRecallConfirmation')
const assessRecallLicencePage = require('../pages/assessRecallLicence')

context('Assess a recall', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'

  it('User can assess a recall', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
        },
      ],
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, recallId } })
    cy.task('expectUpdateRecall', { recallId })
    cy.task('expectPrisonList', { expectedResults: getPrisonList })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectResultsCountText('1 recall')
    recallsList.results().find('tr').should('have.length', 1)
    const firstResult = recallsList.results().first()
    firstResult.get('[data-qa=name]').should('contain.text', 'Bobby Badger')
    recallsList.assessRecall({ recallId })
    let assessRecall = assessRecallPage.verifyOnPage({ fullName: personName })
    assessRecall.assertElementHasText({ qaAttr: 'recallEmailReceivedDateTime', textToFind: '5 Dec 2020 at 15:33' })
    assessRecall.assertElementHasText({ qaAttr: 'recallLength', textToFind: '14 days' })
    assessRecall.assertElementHasText({ qaAttr: 'sentenceExpiryDate', textToFind: '3 Feb 2021' })
    assessRecall.assertElementHasText({ qaAttr: 'sentenceDate', textToFind: '3 Aug 2019' })
    assessRecall.assertElementHasText({ qaAttr: 'licenceExpiryDate', textToFind: '3 Aug 2021' })
    assessRecall.assertElementHasText({ qaAttr: 'localPoliceForce', textToFind: 'Essex' })
    assessRecall.assertElementHasText({ qaAttr: 'sentencingCourt', textToFind: 'Manchester Crown Court' })
    assessRecall.assertElementHasText({ qaAttr: 'indexOffence', textToFind: 'Burglary' })
    assessRecall.assertElementHasText({ qaAttr: 'lastReleasePrison', textToFind: 'Belmarsh' })
    assessRecall.assertElementHasText({ qaAttr: 'lastReleaseDate', textToFind: '3 Aug 2020' })
    assessRecall.assertElementHasText({ qaAttr: 'conditionalReleaseDate', textToFind: '3 Dec 2021' })
    assessRecall.assertElementHasText({ qaAttr: 'sentenceLength', textToFind: '2 years 3 months' })
    assessRecall.assertElementHasText({ qaAttr: 'bookingNumber', textToFind: 'A123456' })
    assessRecall.assertElementHasText({ qaAttr: 'probationOfficerName', textToFind: 'Dave Angel' })
    assessRecall.assertElementHasText({ qaAttr: 'probationOfficerPhoneNumber', textToFind: '07473739388' })
    assessRecall.assertElementHasText({ qaAttr: 'probationOfficerEmail', textToFind: 'probation.office@justice.com' })
    assessRecall.assertElementHasText({ qaAttr: 'probationDivision', textToFind: 'London' })
    assessRecall.assertElementHasText({ qaAttr: 'authorisingAssistantChiefOfficer', textToFind: 'Bob Monkfish' })
    assessRecall.assertElementHasText({
      qaAttr: `uploadedDocument-${getRecallResponse.documents[0].category}`,
      textToFind: 'Licence',
    })
    assessRecall.assertElementHasText({
      qaAttr: `uploadedDocument-${getRecallResponse.documents[1].category}`,
      textToFind: 'Part A recall report',
    })
    assessRecall.clickContinue()
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage()
    assessRecallDecision.makeDecision()
    assessRecallDecision.addDetail()
    assessRecallDecision.clickContinue()
    const assessRecallLicence = assessRecallLicencePage.verifyOnPage()
    assessRecallLicence.enterLicenceConditionsBreached()
    assessRecallLicence.checkReasonsRecalled()
    assessRecallLicence.clickContinue()
    const assessRecallPrison = assessRecallPrisonPage.verifyOnPage({ personName })
    assessRecallPrison.enterPrison()
    assessRecallPrison.clickContinue()
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
    assessRecallDecision.makeDecision()
    assessRecallDecision.clickContinue()
    assessRecallDecision.assertErrorMessage({
      fieldName: 'agreeWithRecallDetailYes',
      summaryError: 'Provide detail on your decision',
      fieldError: 'Provide more detail',
    })
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
      summaryError: 'Licence conditions breached',
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

  it('User can get revocation order', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })

    cy.readFile('integration_tests/expected-revocation-order.pdf', 'base64').then(base64EncodedPdf => {
      cy.task('expectGetRevocationOrder', { recallId, expectedPdfFile: base64EncodedPdf })
      cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })
      cy.login()

      const recall = assessRecallConfirmationPage.verifyOnPage({ nomsNumber, recallId, fullName: 'Bobby Badger' })
      recall.getRevocationOrder()

      validateBinaryFile('revocation-order.pdf', 67658)

      cy.task('readPdf', './cypress/downloads/revocation-order.pdf').then(({ numpages, text }) => {
        expect(numpages, 'number of PDF pages').to.equal(1)
        expect(text, 'has expected text').to.include('REVOCATION OF LICENCE')
      })
    })
  })
})
