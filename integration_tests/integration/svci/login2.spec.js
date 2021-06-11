const IndexPage = require('../../pages')
const AuthLoginPage = require('../../pages/authLogin')
const VerifyEmailPage = require('../../pages/verifyEmail')

context('Login', () => {
  const username = Cypress.env('AUTH_USERNAME')
  const password = Cypress.env('AUTH_PASSWORD')

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    AuthLoginPage.verifyOnPage()
  })

  it('User name visible in header', () => {
    AuthLoginPage.enterUsername(username)
    AuthLoginPage.enterPassword(password)

    VerifyEmailPage.verifyOnPage()
    VerifyEmailPage.cancel().click()

    const landingPage = IndexPage.verifyOnPage()
    landingPage.headerUserName().should('contain.text', 'P. User')
  })

  it('User can log out', () => {
    const landingPage = IndexPage.verifyOnPage()
    landingPage.logout().click()
    AuthLoginPage.verifyOnPage()
  })
})
