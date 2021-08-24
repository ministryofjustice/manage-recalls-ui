import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

import validateBinaryFile from './file-utils'
import recallsListPage from '../pages/recallsList'

const assessRecallPage = require('../pages/assessRecall')
const assessRecallDecisionPage = require('../pages/assessRecallDecision')
const assessRecallConfirmationPage = require('../pages/assessRecallConfirmation')

context('Assess a recall', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'

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
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectResultsCountText('1 recall')
    recallsList.results().find('tr').should('have.length', 1)
    const firstResult = recallsList.results().first()
    firstResult.get('[data-qa=name]').should('contain.text', 'Bobby Badger')
    recallsList.assessRecall({ recallId })
    const assessRecall = assessRecallPage.verifyOnPage({ fullName: 'Bobby Badger' })
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
    assessRecallDecision.clickContinue()
    assessRecallConfirmationPage.verifyOnPage({ fullName: 'Bobby Badger' })
  })

  it("User sees an error if they don't make a decision", () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, recallId } })
    cy.login()

    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: 'Bobby Badger' })
    assessRecall.assertElementHasText({ qaAttr: 'recallLength', textToFind: '14 days' })
    assessRecall.clickContinue()
    const assessRecallDecision = assessRecallDecisionPage.verifyOnPage()
    assessRecallDecision.clickContinue()
    assessRecallDecision.expectError()
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
