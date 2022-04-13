context('Login', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.visit('/')
    cy.pageHeading().should('contain', 'Sign in')
  })

  it('User can see their name in the header and can log out', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.login()
    cy.pageHeading().should('equal', 'Recalls')
    cy.getText('header-user-name').should('contain', 'M. Badger')
    cy.clickLink('Sign out')
    cy.pageHeading().should('contain', 'Sign in')
  })
})
