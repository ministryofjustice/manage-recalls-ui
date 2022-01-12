const page = require('./page')

const changeHistoryFieldPage = ({ nomsNumber, recallId, fieldId } = {}) =>
  page('Field change history', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/change-history/fields?id=${fieldId}` : null,
  })

module.exports = { verifyOnPage: changeHistoryFieldPage }
