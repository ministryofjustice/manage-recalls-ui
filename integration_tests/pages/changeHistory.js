const page = require('./page')

const changeHistoryPage = ({ nomsNumber, recallId } = {}) =>
  page('Change history', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/change-history` : null,
  })

module.exports = { verifyOnPage: changeHistoryPage }
