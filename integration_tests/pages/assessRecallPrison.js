const page = require('./page')

const assessRecallPrisonPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`In which prison is ${personName}?`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-prison` : null,
    enterPrison: () => {
      cy.get('[name="currentPrison"]').select('Albany (HMP)')
    },
  })

module.exports = { verifyOnPage: assessRecallPrisonPage }
