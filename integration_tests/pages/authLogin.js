const page = require('./page')

const enterUsername = username => cy.get('input[name=username]').type(username)
const enterPassword = password => cy.get('input[name=password]').type(`${password}{enter}`)

module.exports = {
  verifyOnPage: () => page('Sign in', {}),
  enterUsername,
  enterPassword,
}
