const page = require('./page')

const dossierDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download the dossier and letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-download` : null,
    getDossier: () => cy.get('[data-qa=dossier-link]').click(),
    checkDossierLink: ({ noms, recall }) => {
      cy.get('[data-qa=getDossierLink]')
        .should('have.attr', 'href')
        .and('include', `/persons/${noms}/recalls/${recall}/documents/dossier`)
    },
    confirmDossierChecked: () => cy.get(`[value="${'YES'}"]`).check(),
  })

module.exports = { verifyOnPage: dossierDownloadPage }
