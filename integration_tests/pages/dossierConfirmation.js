const page = require('./page')

const createDossierConfirmationPage = ({ nomsNumber, recallId } = {}) =>
  page('Dossier creation completed', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-confirmation` : null,
  })

module.exports = { verifyOnPage: createDossierConfirmationPage }
