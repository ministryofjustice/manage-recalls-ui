const page = require('./page')

const assessRecallPage = ({ nomsNumber, recallId, fullName }) =>
  page(fullName, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess` : null,
    clickContinue: () => cy.get('[data-qa=continueButton]').click(),
  })

module.exports = { verifyOnPage: assessRecallPage }
