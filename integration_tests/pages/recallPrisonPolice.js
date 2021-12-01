const page = require('./page')

const recallPrisonPolicePage = ({ nomsNumber, recallId } = {}) =>
  page('What is the name of the local police force?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/prison-police` : null,
    setLocalPoliceForce: () => {
      cy.get('[id="localPoliceForce"]').clear().type('Met')
      cy.contains('Metropolitan').click({ force: true })
    },
    enterLocalPoliceForce: nameSubString => {
      cy.get('[id="localPoliceForce"]')
        .clear()
        .type(nameSubString || 'Met')
    },
  })

module.exports = { verifyOnPage: recallPrisonPolicePage }
