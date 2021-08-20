const page = require('./page')

const assessRecallPage = ({ nomsNumber, recallId, fullName }) =>
  page(fullName, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess` : null,
  })

module.exports = { verifyOnPage: assessRecallPage }
