import validateBinaryFile from './file-utils'

const IndexPage = require('../pages/index')

context('Generate revocation order', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = '123ABC'
  it('User can generate revocation order', () => {
    expectSearchResultsFromManageRecallsApi(nomsNumber, [
      {
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1999-05-28',
      },
    ])

    cy.readFile('integration_tests/expected-revocation-order.pdf', 'base64').then(base64EncodedPdf => {
      expectRevocationOrderFromManageRecallsApi({ content: base64EncodedPdf })
      cy.login()

      const homePage = IndexPage.verifyOnPage()
      homePage.searchFor(nomsNumber)
      homePage.expectSearchResultsCountText('1 person found')
      homePage.searchResults().find('tr').should('have.length', 1)
      const firstResult = homePage.searchResults().first()
      firstResult.get('[data-qa=generateRevocationOrderButton]').click()

      validateBinaryFile('revocation-order.pdf', 67658)

      cy.task('readPdf', './cypress/downloads/revocation-order.pdf').then(({ numpages, text }) => {
        expect(numpages, 'number of PDF pages').to.equal(1)
        expect(text, 'has expected text').to.include('REVOCATION OF LICENCE')
      })
    })
  })

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }

  function expectRevocationOrderFromManageRecallsApi(expectedPdfFile) {
    cy.task('expectGenerateRevocationOrder', expectedPdfFile)
  }
})
