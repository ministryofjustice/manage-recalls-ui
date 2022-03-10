const page = require('./page')

const assessRecallEmailPage = ({ recallId } = {}) =>
  page('Email the recall notification', {
    url: recallId ? `/recalls/${recallId}/assess-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
  })

module.exports = { verifyOnPage: assessRecallEmailPage }
