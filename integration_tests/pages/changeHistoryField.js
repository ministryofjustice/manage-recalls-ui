const page = require('./page')

const changeHistoryFieldPage = ({ recallId, fieldId } = {}) =>
  page('Field change history', {
    url: recallId ? `/recalls/${recallId}/change-history/fields?id=${fieldId}` : null,
  })

module.exports = { verifyOnPage: changeHistoryFieldPage }
