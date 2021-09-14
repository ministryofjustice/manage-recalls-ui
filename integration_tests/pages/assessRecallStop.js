const page = require('./page')

const assessRecallStopPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`${personName}'s recall has been stopped`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-stop` : null,
  })

module.exports = { verifyOnPage: assessRecallStopPage }
