const page = require('./page')

const uploadDocumentVersionPage = ({ nomsNumber, recallId, documentCategoryLabel } = {}) =>
  page(`Upload a new ${documentCategoryLabel}`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/upload-document-version` : null,
    uploadSingleFile: file => {
      cy.get(`[name="documents"]`).attachFile(file)
    },
  })

module.exports = { verifyOnPage: uploadDocumentVersionPage }
