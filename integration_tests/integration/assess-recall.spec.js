import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

import validateBinaryFile from './file-utils'

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
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, recallId } })
    cy.task('expectUpdateRecall', { recallId })
    cy.login()

    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: 'Bobby Badger' })
    assessRecall.assertElementHasText({ qaAttr: 'recallEmailReceivedDateTime', textToFind: '5 Dec 2020 at 15:33' })
    assessRecall.assertElementHasText({ qaAttr: 'recallLength', textToFind: '14 days' })
    assessRecall.assertElementHasText({ qaAttr: 'lastReleasePrison', textToFind: 'Belmarsh' })
    assessRecall.assertElementHasText({ qaAttr: 'lastReleaseDateTime', textToFind: '3 Aug 2020' })
    assessRecall.assertElementHasText({ qaAttr: 'localPoliceService', textToFind: 'Brentwood, Essex' })
    assessRecall.assertElementHasText({
      qaAttr: `uploadedDocument-${getRecallResponse.documents[0].category}`,
      textToFind: 'Download PDF',
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
