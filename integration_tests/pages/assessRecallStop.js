const page = require('./page')

const assessRecallStopPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`Recall stopped for ${personName}`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-stop` : null,
  })

module.exports = { verifyOnPage: assessRecallStopPage }
