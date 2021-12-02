const page = require('./page')

const bookConfirmationPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`Recall booked for ${personName}`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/recall-confirmation` : null,
  })

module.exports = { verifyOnPage: bookConfirmationPage }
