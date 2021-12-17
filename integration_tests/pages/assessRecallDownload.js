const page = require('./page')

const assessRecallDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-download` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
  })

module.exports = { verifyOnPage: assessRecallDownloadPage }
