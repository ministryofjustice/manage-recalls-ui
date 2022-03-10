const page = require('./page')

const recallInformationPage = ({ recallId, personName } = {}) =>
  page(`View the recall for ${personName}`, {
    url: recallId ? `/recalls/${recallId}/view-recall` : null,
  })

module.exports = { verifyOnPage: recallInformationPage }
