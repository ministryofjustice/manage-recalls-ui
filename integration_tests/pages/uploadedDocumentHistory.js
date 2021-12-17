const page = require('./page')

const uploadedDocumentHistoryPage = ({ nomsNumber, recallId, category } = {}) =>
  page('Uploaded document change history', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/change-history/document?category=${category}` : null,
  })

module.exports = { verifyOnPage: uploadedDocumentHistoryPage }
