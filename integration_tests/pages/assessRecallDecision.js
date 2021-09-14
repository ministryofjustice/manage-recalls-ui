const page = require('./page')

const assessRecallDecisionPage = ({ nomsNumber, recallId } = {}) =>
  page('Do you agree with the fixed term 14 day recall recommendation?', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-decision` : null,
    makeYesDecision: () => cy.get('[value="YES"]').click(),
    makeNoDecision: () => cy.get('[value="NO_STOP"]').click(),
    addYesDetail: () =>
      cy.get('[name="agreeWithRecallDetailYes"]').clear().type('No evidence that the recommendation was wrong'),
    addNoDetail: () => cy.get('[name="agreeWithRecallDetailNo"]').clear().type('Insufficient evidence for the recall'),
  })

module.exports = { verifyOnPage: assessRecallDecisionPage }
