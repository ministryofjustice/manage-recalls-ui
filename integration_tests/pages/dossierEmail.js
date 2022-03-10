const page = require('./page')

const assessDossierEmailPage = ({ recallId } = {}) =>
  page('Email the dossier and letter', {
    url: recallId ? `/recalls/${recallId}/dossier-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
  })

module.exports = { verifyOnPage: assessDossierEmailPage }
