const page = require('./page')

const assessDossierEmailPage = ({ nomsNumber, recallId } = {}) =>
  page('Email the dossier', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-email` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
    uploadEmail: fileName => {
      cy.get('[name="dossierEmailFileName"]').attachFile({
        filePath: `../uploads/${fileName}`,
        mimeType: 'application/octet-stream',
      })
    },
  })

module.exports = { verifyOnPage: assessDossierEmailPage }
