const page = require('./page')

const assessRecallStopPage = ({ recallId, personName } = {}) =>
  page(`Recall stopped for ${personName}`, {
    url: recallId ? `/recalls/${recallId}/assess-stop` : null,
  })

module.exports = { verifyOnPage: assessRecallStopPage }
