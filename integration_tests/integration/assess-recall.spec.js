import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

import validateBinaryFile from './file-utils'

const assessRecallPage = require('../pages/assessRecall')

context('Assess a recall', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = 'RECALL_ID'

  it('User can assess a recall', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })
    cy.login()

    const assessRecall = assessRecallPage.verifyOnPage(recallId)
    assessRecall.expectOffenderName('Bobby Badger')
  })

  it('User can get revocation order', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })

    cy.readFile('integration_tests/expected-revocation-order.pdf', 'base64').then(base64EncodedPdf => {
      cy.task('expectGetRevocationOrder', { recallId, expectedPdfFile: base64EncodedPdf })
      cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })
      cy.login()

      const recall = assessRecallPage.verifyOnPage(recallId)
      recall.getRevocationOrder()

      validateBinaryFile('revocation-order.pdf', 67658)

      cy.task('readPdf', './cypress/downloads/revocation-order.pdf').then(({ numpages, text }) => {
        expect(numpages, 'number of PDF pages').to.equal(1)
        expect(text, 'has expected text').to.include('REVOCATION OF LICENCE')
      })
    })
  })
})
