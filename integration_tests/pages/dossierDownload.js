const page = require('./page')

const dossierDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download the dossier and letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-download` : null,
  })

module.exports = { verifyOnPage: dossierDownloadPage }
