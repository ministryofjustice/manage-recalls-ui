const page = require('./page')

const assessRecallEmailPage = ({ nomsNumber, recallId } = {}) =>
  page('Email the recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
    uploadEmail: () => {
      cy.get('[name="recallNotificationEmailFileName"]').attachFile({
        filePath: '../uploads/recall-notification.eml',
        mimeType: 'application/octet-stream',
      })
    },
  })

module.exports = { verifyOnPage: assessRecallEmailPage }
