const page = require('./page')

const uploadDocumentVersionPage = ({ nomsNumber, recallId, documentCategoryLabel, documentCategoryName } = {}) =>
  page(`Upload a new ${documentCategoryLabel}`, {
    url: recallId
      ? `/persons/${nomsNumber}/recalls/${recallId}/upload-document-version?versionedCategoryName=${documentCategoryName}`
      : null,
    uploadSingleFile: file => {
      cy.get(`[name="document"]`).attachFile(file)
    },
  })

module.exports = { verifyOnPage: uploadDocumentVersionPage }
