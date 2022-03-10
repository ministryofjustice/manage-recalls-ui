const page = require('./page')

const dossierDownloadPage = ({ recallId } = {}) =>
  page('Download the dossier and letter', {
    url: recallId ? `/recalls/${recallId}/dossier-download` : null,
    confirmDossierChecked: () => cy.get(`[value="${'YES'}"]`).check(),
  })

module.exports = { verifyOnPage: dossierDownloadPage }
