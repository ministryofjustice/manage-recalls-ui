const page = require('./page')

const newGeneratedDocumentVersionPage = ({ nomsNumber, recallId, documentCategoryLabel, documentCategoryName } = {}) =>
  page(`Create a new ${documentCategoryLabel}`, {
    url: recallId
      ? `/persons/${nomsNumber}/recalls/${recallId}/generated-document-version?fromPage=view-recall&versionedCategoryName=${documentCategoryName}`
      : null,
  })

module.exports = { verifyOnPage: newGeneratedDocumentVersionPage }
