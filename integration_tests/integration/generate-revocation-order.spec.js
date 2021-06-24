const IndexPage = require('../pages/index')

context('Generate revocation order', () => {
  beforeEach(() => {
    cy.task('resetAndStubLogin')
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

    cy.login()
    const homePage = IndexPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('1 person found')
    homePage.searchResults().find('tr').should('have.length', 1)
    const firstResult = homePage.searchResults().first()
    firstResult.get('[data-qa=generateRevocationOrderButton]').click()
    firstResult.get('[data-qa=data]')
  })

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }
})
