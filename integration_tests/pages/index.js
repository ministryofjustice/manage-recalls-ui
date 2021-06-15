const page = require('./page')

const indexPage = () =>
  page('Find an offender', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
    searchFor: searchText => cy.get('[data-qa=search-field]').type(`${searchText}{enter}`),
    search: () => cy.get('[data-qa=search]').click(),
    searchResults: () => cy.get('[data-qa=search-results]'),
  })

module.exports = { verifyOnPage: indexPage }
