const page = require('./page')

const dossierDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download the dossier and letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-download` : null,
    getDossier: () => cy.get('[data-qa=dossier-link]').click(),
    checkDossierLink: recall => {
      cy.get('[data-qa=getDossierLink]').should('have.attr', 'href').and('include', `/get-dossier?recallId=${recall}`)
    },
  })

module.exports = { verifyOnPage: dossierDownloadPage }
