const page = require('./page')

const assessRecallPrisonPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`In which prison is ${personName}?`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-prison` : null,
    enterPrison: () => {
      cy.get('[id="currentPrison"]').clear().type('Kenn')
      cy.contains('Kennet (HMP)').click()
    },
  })

module.exports = { verifyOnPage: assessRecallPrisonPage }
