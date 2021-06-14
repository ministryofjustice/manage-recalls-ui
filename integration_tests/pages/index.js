const page = require('./page')

const indexPage = () =>
  page('Manage a recall for an offender on licence', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
    startRecall: () => cy.get('[data-qa=start-recall]').click(),
  })

module.exports = { verifyOnPage: indexPage }
