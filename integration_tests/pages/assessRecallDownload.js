const page = require('./page')

const assessRecallDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-download` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
    checkRecallNotificationLink: recall => {
      cy.get('[data-qa=getRevocationOrderLink]')
        .should('have.attr', 'href')
        .and('include', `/get-revocation-order?recallId=${recall}`)
    },
  })

module.exports = { verifyOnPage: assessRecallDownloadPage }
