const page = require('./page')

const dossierLetterPage = ({ recallId } = {}) =>
  page('Add information to the prison letter', {
    url: recallId ? `/recalls/${recallId}/dossier-letter` : null,
    additionalLicenceConditions: () => cy.get('[name="additionalLicenceConditions"][value="YES"]').click(),
    differentNomsNumber: () => cy.get('[name="differentNomsNumber"][value="YES"]').click(),
    addLicenceDetail: () => cy.get('[name="additionalLicenceConditionsDetail"]').clear().type('one, two'),
    addNomsDetail: noms =>
      cy
        .get('[name="differentNomsNumberDetail"]')
        .clear()
        .type(noms || 'A1234AB'),
  })

module.exports = { verifyOnPage: dossierLetterPage }
