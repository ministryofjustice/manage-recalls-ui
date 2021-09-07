const page = require('./page')

const assessRecallConfirmationPage = ({ nomsNumber, recallId, fullName }) =>
  page(`Recall for ${fullName} is authorised`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-confirmation` : null,
  })

module.exports = { verifyOnPage: assessRecallConfirmationPage }
