const IndexPage = require('../pages/index')
const StartRecallPage = require('../pages/startRecall')

context('Search for offenders', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubOffenderSearch')
  })

  it('User can search for prisoners', () => {
    cy.login()
    const homePage = IndexPage.verifyOnPage()
    homePage.startRecall()
    const searchPage = StartRecallPage.verifyOnPage()
    searchPage.enterSearchText('Bertie Badger')
    searchPage.search()
    searchPage.searchResults().should('contain.text', '123ABC')
  })
})
