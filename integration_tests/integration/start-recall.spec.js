const IndexPage = require('../pages/index')

context('Search for offenders', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectSearchResults', {
      expectedSearchTerm: '123ABC',
      expectedSearchResults: [
        {
          firstName: 'Bobby',
          lastName: 'Badger',
          nomsNumber: '123ABC',
          dateOfBirth: '1999-05-28',
        },
      ],
    })
  })

  it('User can search for a prisoner', () => {
    cy.login()
    const homePage = IndexPage.verifyOnPage()
    homePage.searchFor('123ABC')
    const firstResult = homePage.searchResults().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', '123ABC')
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '28 May 1999')
  })
})
