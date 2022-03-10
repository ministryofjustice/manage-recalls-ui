const page = require('./page')

const getHeading = type => {
  switch (type) {
    case 'generated':
      return 'Generated document change history'
    case 'document':
      return 'Uploaded document change history'
    case 'email':
      return 'Uploaded email change history'
    default:
      throw new Error(`Unknown type: ${type}`)
  }
}
const changeHistoryDocumentPage = ({ recallId, category, type } = {}) =>
  page(getHeading(type), {
    url: recallId ? `/recalls/${recallId}/change-history/document?category=${category}` : null,
  })

module.exports = { verifyOnPage: changeHistoryDocumentPage }
