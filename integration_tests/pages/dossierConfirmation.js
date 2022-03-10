const page = require('./page')

const createDossierConfirmationPage = ({ recallId } = {}) =>
  page('Dossier created and sent', {
    url: recallId ? `/recalls/${recallId}/dossier-confirmation` : null,
  })

module.exports = { verifyOnPage: createDossierConfirmationPage }
