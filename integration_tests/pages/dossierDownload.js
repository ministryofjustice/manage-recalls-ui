const page = require('./page')

const dossierDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download the dossier and letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-download` : null,
    confirmDossierChecked: () => cy.get(`[value="${'YES'}"]`).check(),
  })

module.exports = { verifyOnPage: dossierDownloadPage }
