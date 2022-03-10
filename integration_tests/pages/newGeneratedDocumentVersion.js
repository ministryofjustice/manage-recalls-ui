const page = require('./page')

const newGeneratedDocumentVersionPage = ({ recallId, documentCategoryLabel, documentCategoryName } = {}) =>
  page(`Create a new ${documentCategoryLabel}`, {
    url: recallId
      ? `/recalls/${recallId}/generated-document-version?fromPage=view-recall&versionedCategoryName=${documentCategoryName}`
      : null,
  })

module.exports = { verifyOnPage: newGeneratedDocumentVersionPage }
