const page = require('./page')

const checkAnswersPage = ({ nomsNumber, recallId } = {}) =>
  page('Check the details before booking this recall', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/check-answers` : null,
  })

module.exports = { verifyOnPage: checkAnswersPage }
