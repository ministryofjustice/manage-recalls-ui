const page = require('./page')

const changeHistoryPage = ({ recallId } = {}) =>
  page('Change history', {
    url: recallId ? `/recalls/${recallId}/change-history` : null,
  })

module.exports = { verifyOnPage: changeHistoryPage }
