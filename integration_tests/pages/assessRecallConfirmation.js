const page = require('./page')

const assessRecallConfirmationPage = ({ nomsNumber, recallId, fullName }) =>
  page(`Recall for ${fullName} is authorised`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-confirmation` : null,
    getRevocationOrder: () => cy.get('[data-qa=getRevocationOrderButton]').click(),
  })

module.exports = { verifyOnPage: assessRecallConfirmationPage }
