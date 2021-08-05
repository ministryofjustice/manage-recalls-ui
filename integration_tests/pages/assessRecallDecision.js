const page = require('./page')

const assessRecallDecisionPage = ({ nomsNumber, recallId } = {}) =>
  page('What is your decision on the recall recommendation?', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-decision` : null,
    makeDecision: () => {
      cy.get('[value="YES"]').click()
    },
    expectError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Indicate if you agree or disagree with the recommended recall length')
      })
    },
    clickContinue: () => cy.get('[data-qa=continueButton]').click(),
  })

module.exports = { verifyOnPage: assessRecallDecisionPage }
