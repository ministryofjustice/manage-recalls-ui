const page = require('./page')

const dossierRecallInformationPage = ({ recallId, personName } = {}) =>
  page(`Create a dossier for ${personName} recall`, {
    url: recallId ? `/recalls/${recallId}/dossier-recall` : null,
  })

module.exports = { verifyOnPage: dossierRecallInformationPage }
