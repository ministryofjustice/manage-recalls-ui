const page = require('./page')

const uploadedDocumentHistoryPage = ({ nomsNumber, recallId, category } = {}) =>
  page('Uploaded document change history', {
    url: nomsNumber
      ? `/persons/${nomsNumber}/recalls/${recallId}/change-history/uploaded-documents?category=${category}`
      : null,
  })

module.exports = { verifyOnPage: uploadedDocumentHistoryPage }
