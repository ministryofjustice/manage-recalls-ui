const page = require('./page')

const offenderProfilePage = ({ nomsNumber, personName }) =>
  page(personName, {
    url: nomsNumber ? `/persons/${nomsNumber}` : null,
    createRecall: () => cy.get('[data-qa=createRecallButton]').click(),
  })

module.exports = { verifyOnPage: offenderProfilePage }
