const page = require('./page')

const assessRecallDecisionPage = ({ nomsNumber, recallId } = {}) =>
  page('Do you agree with the fixed term 14 day recall recommendation?', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-decision` : null,
    makeDecision: () => cy.get('[value="YES"]').click(),
    addDetail: () =>
      cy.get('[name="agreeWithRecallDetailYes"]').clear().type('No evidence that the recommendation was wrong'),
  })

module.exports = { verifyOnPage: assessRecallDecisionPage }
