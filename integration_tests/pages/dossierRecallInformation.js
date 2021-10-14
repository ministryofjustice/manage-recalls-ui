const page = require('./page')

const dossierRecallInformationPage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`Create a dossier for ${personName} recall`, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-recall` : null,
  })

module.exports = { verifyOnPage: dossierRecallInformationPage }
