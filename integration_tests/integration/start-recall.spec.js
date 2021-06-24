const IndexPage = require('../pages/index')

context('Search for offenders', () => {
  beforeEach(() => {
    cy.task('resetAndStubLogin')
  })

  const nomsNumber = '123ABC'
  it('User can search for a prisoner', () => {
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
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '28 May 1999')
  })

  it('prisoner search returns no results', () => {
    cy.task('resetAndStubLogin')
    cy.login()
    expectSearchResultsFromManageRecallsApi(nomsNumber, [])

    const homePage = IndexPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('0 people found')
  })

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }
})
