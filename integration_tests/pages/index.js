const page = require('./page')

const indexPage = () =>
  page('Manage a recall for an offender on licence', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
  })

module.exports = { verifyOnPage: indexPage }
