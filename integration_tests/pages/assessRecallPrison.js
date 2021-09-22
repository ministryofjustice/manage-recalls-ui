const page = require('./page')

const assessRecallPrisonPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`Which prison is ${personName} in?`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-prison` : null,
    enterPrison: () => {
      cy.get('[id="currentPrison"]').clear().type('Kenn')
      cy.contains('Kennet (HMP)').click()
    },
  })

module.exports = { verifyOnPage: assessRecallPrisonPage }
