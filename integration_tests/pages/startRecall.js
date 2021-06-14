const page = require('./page')

const startRecallPage = () =>
  page('Find an offender', {
    searchFor: searchText => cy.get('[data-qa=search-field]').type(`${searchText}{enter}`),
    search: () => cy.get('[data-qa=search]').click(),
    searchResults: () => cy.get('[data-qa=search-results]'),
  })

module.exports = { verifyOnPage: startRecallPage }
