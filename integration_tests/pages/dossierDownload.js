const page = require('./page')

const dossierDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download the dossier and letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-download` : null,
    getDossier: () => cy.get('[data-qa=dossier-link]').click(),
  })

module.exports = { verifyOnPage: dossierDownloadPage }
