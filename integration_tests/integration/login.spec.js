const IndexPage = require('../pages/findOffender')
const AuthLoginPage = require('../pages/authLogin')

context('Login', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.visit('/')
    AuthLoginPage.verifyOnPage()
  })

  it('User can see their name in the header and can log out', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.login()
    const landingPage = IndexPage.verifyOnPage()
    landingPage.headerUserName().should('contain.text', 'J. Smith')
    landingPage.logout().click()
    AuthLoginPage.verifyOnPage()
  })
})
