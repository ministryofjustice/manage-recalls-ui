import validateBinaryFile from './file-utils'
import { searchResponseJson } from '../mockApis/mockResponses'

const offenderProfilePage = require('../pages/offenderProfile')

context('Offender profile', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  it('User can generate revocation order', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponseJson })

    cy.readFile('integration_tests/expected-revocation-order.pdf', 'base64').then(base64EncodedPdf => {
      cy.task('expectGenerateRevocationOrder', {
        expectedSearchTerm: nomsNumber,
        expectedPdfFile: { content: base64EncodedPdf },
      })
      cy.login()

      const offenderProfile = offenderProfilePage.verifyOnPage(nomsNumber)
      offenderProfile.generateRevocationOrder()

      validateBinaryFile('revocation-order.pdf', 67658)

      cy.task('readPdf', './cypress/downloads/revocation-order.pdf').then(({ numpages, text }) => {
        expect(numpages, 'number of PDF pages').to.equal(1)
        expect(text, 'has expected text').to.include('REVOCATION OF LICENCE')
      })
    })
  })

  it('User can create a recall', () => {
    const recallId = '123'
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponseJson })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.login()

    const offenderProfile = offenderProfilePage.verifyOnPage(nomsNumber)
    offenderProfile.createRecall()
    offenderProfile.expectRecallIdConfirmation(`Recall ID: ${recallId}`)
  })
})
