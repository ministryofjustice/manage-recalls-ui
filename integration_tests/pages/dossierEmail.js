const page = require('./page')

const assessDossierEmailPage = ({ nomsNumber, recallId } = {}) =>
  page('Email the dossier and letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
  })

module.exports = { verifyOnPage: assessDossierEmailPage }
