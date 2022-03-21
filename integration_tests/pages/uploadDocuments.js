const page = require('./page')

const uploadDocumentsPage = ({ recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/recalls/${recallId}/upload-documents` : null,
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
