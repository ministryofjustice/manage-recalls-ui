const page = require('./page')

const dossierCheckPage = ({ nomsNumber, recallId } = {}) =>
  page('Check and create the reasons for recall document', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-check` : null,
  })

module.exports = { verifyOnPage: dossierCheckPage }
