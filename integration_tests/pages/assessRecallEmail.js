const page = require('./page')

const assessRecallEmailPage = ({ nomsNumber, recallId } = {}) =>
  page('Email the recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
    uploadEmail: fileName => {
      cy.get('[name="recallNotificationEmailFileName"]').attachFile({
        filePath: `../uploads/${fileName}`,
        mimeType: 'application/octet-stream',
      })
    },
  })

module.exports = { verifyOnPage: assessRecallEmailPage }
