const page = require('./page')

const assessRecallDecisionPage = ({ nomsNumber, recallId } = {}) =>
  page('What is your decision on the recall recommendation?', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-decision` : null,
    makeDecision: () => {
      cy.get('[value="YES"]').click()
      cy.get('[data-qa=continueButton]').click()
    },
  })

module.exports = { verifyOnPage: assessRecallDecisionPage }
