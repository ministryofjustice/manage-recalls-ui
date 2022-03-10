const page = require('./page')

const recallMissingDocumentsPage = ({ recallId } = {}) =>
  page('Missing documents', {
    url: recallId ? `/recalls/${recallId}/missing-documents` : null,
  })

module.exports = { verifyOnPage: recallMissingDocumentsPage }
