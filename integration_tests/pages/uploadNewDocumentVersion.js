const page = require('./page')

const uploadDocumentVersionPage = ({ recallId, documentCategoryLabel, documentCategoryName } = {}) =>
  page(`Upload a new ${documentCategoryLabel}`, {
    url: recallId ? `/recalls/${recallId}/upload-document-version?versionedCategoryName=${documentCategoryName}` : null,
    uploadSingleFile: file => {
      cy.get(`[name="document"]`).attachFile(file)
    },
  })

module.exports = { verifyOnPage: uploadDocumentVersionPage }
