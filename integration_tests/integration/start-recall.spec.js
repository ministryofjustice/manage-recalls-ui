const IndexPage = require('../pages/index')
const StartRecallPage = require('../pages/startRecall')

context('Search for offenders', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectSearchResults', {
      expectedSearchTerm: 'Bertie Badger',
      expectedSearchResults: [
        {
          firstName: 'Bobby',
          lastName: 'Badger',
          nomisNumber: '123ABC',
          dateOfBirth: '1999-05-28',
        },
      ],
    })
  })

  it('User can search for a prisoner', () => {
    cy.login()
    const homePage = IndexPage.verifyOnPage()
    homePage.startRecall()
    const searchPage = StartRecallPage.verifyOnPage()
    searchPage.searchFor('Bertie Badger')
    const firstResult = searchPage.searchResults().first()
    firstResult.get('[data-qa=nomisNumber]').should('contain.text', '123ABC')
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '1999-05-28')
  })
})
