const page = require('./page')

const assessRecallEmailPage = ({ nomsNumber, recallId } = {}) =>
  page('Email the recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
  })

module.exports = { verifyOnPage: assessRecallEmailPage }
