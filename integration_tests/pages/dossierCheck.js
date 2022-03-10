const page = require('./page')

const dossierCheckPage = ({ recallId } = {}) =>
  page('Check and create the reasons for recall document', {
    url: recallId ? `/recalls/${recallId}/dossier-check` : null,
  })

module.exports = { verifyOnPage: dossierCheckPage }
