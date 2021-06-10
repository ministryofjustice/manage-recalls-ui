const IndexPage = require('../../pages')
const AuthLoginPage = require('../../pages/authLogin')
const VerifyEmailPage = require('../../pages/verifyEmail')

context('Login', () => {
  const username = 'PPUD_USER'
  const password = `password123456`

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    AuthLoginPage.verifyOnPage()
  })

  it('User name visible in header', () => {
    cy.visit('/').pause()
    AuthLoginPage.verifyOnPage()
    cy.get('input[name=username]').type(username)
    cy.get('input[name=password]').type(`${password}{enter}`)

    VerifyEmailPage.verifyOnPage()
    cy.get('#cancel').click()

    const landingPage = IndexPage.verifyOnPage()
    landingPage.headerUserName().should('contain.text', 'P. User')
  })

  it('User can log out', () => {
    const landingPage = IndexPage.verifyOnPage()
    landingPage.logout().click()
    AuthLoginPage.verifyOnPage()
  })
})
