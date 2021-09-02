const page = require('./page')

const dossierLetterPage = ({ nomsNumber, recallId } = {}) =>
  page('Add information to the prison letter', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/dossier-letter` : null,
    additionalLicenceConditions: () => cy.get('[name="additionalLicenceConditions"][value="YES"]').click(),
    differentNomsNumber: () => cy.get('[name="differentNomsNumber"][value="YES"]').click(),
    addLicenceDetail: () => cy.get('[name="additionalLicenceConditionsDetail"]').clear().type('one, two'),
    addNomsDetail: () => cy.get('[name="differentNomsNumberDetail"]').clear().type('AC3408303'),
  })

module.exports = { verifyOnPage: dossierLetterPage }
