const page = require('./page')

const assessRecallConfirmationPage = ({ nomsNumber, recallId, fullName }) =>
  page(`Recall assessed for ${fullName}`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-confirmation` : null,
  })

module.exports = { verifyOnPage: assessRecallConfirmationPage }
