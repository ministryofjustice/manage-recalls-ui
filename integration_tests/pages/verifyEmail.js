const page = require('./page')

const cancel = () => cy.get('#cancel').click()

module.exports = {
  verifyOnPage: () => page('Verify your email address', {}),
  cancel,
}
