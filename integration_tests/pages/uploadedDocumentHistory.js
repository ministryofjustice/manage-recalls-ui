const page = require('./page')

const changeHistoryDocumentPage = ({ nomsNumber, recallId, category, isUploaded } = {}) =>
  page(`${isUploaded ? 'Uploaded' : 'Generated'} document change history`, {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/change-history/document?category=${category}` : null,
  })

module.exports = { verifyOnPage: changeHistoryDocumentPage }
