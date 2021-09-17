const page = require('./page')

const findPersonPage = nomsNumber =>
  page('Find a person', {
    url: nomsNumber ? `/find-person?nomsNumber=${nomsNumber}` : '/find-person',
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
    searchFor: searchText => cy.get('[data-qa=search-field]').type(`${searchText}{enter}`),
    search: () => cy.get('[data-qa=search]').click(),
    searchResults: () => cy.get('[data-qa=search-results]'),
    expectSearchResultsCountText: expectedText => {
      cy.get('[data-qa=search-results-count]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(expectedText)
      })
    },
  })

module.exports = { verifyOnPage: findPersonPage }
