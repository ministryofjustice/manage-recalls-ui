const page = require('./page')

const assessRecallPage = ({ nomsNumber, recallId }) =>
  page('Recall information', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess` : null,
  })

module.exports = { verifyOnPage: assessRecallPage }
