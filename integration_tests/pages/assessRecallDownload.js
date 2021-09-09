const page = require('./page')

const assessRecallDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-download` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
    checkRecallNotificationLink: ({ noms, recall }) => {
      cy.get('[data-qa=getRecallNotificationLink]')
        .should('have.attr', 'href')
        .and('include', `/persons/${noms}/recalls/${recall}/documents/recall-notification`)
    },
  })

module.exports = { verifyOnPage: assessRecallDownloadPage }
