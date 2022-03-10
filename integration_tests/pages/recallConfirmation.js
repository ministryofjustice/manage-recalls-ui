const page = require('./page')

const bookConfirmationPage = ({ recallId, personName } = {}) =>
  page(`Recall booked for ${personName}`, {
    url: recallId ? `/recalls/${recallId}/recall-confirmation` : null,
  })

module.exports = { verifyOnPage: bookConfirmationPage }
