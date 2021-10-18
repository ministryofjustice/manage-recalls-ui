const page = require('./page')

const recallInformationPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`View the recall for ${personName}`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/view-recall` : null,
  })

module.exports = { verifyOnPage: recallInformationPage }
