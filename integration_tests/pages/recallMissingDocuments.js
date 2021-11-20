const page = require('./page')

const recallMissingDocumentsPage = ({ nomsNumber, recallId } = {}) =>
  page('Missing documents', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/missing-documents` : null,
  })

module.exports = { verifyOnPage: recallMissingDocumentsPage }
