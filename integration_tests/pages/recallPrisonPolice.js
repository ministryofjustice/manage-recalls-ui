const page = require('./page')

const recallPrisonPolicePage = ({ recallId } = {}) =>
  page('What is the name of the local police force?', {
    url: recallId ? `/recalls/${recallId}/prison-police` : null,
    setLocalPoliceForceId: () => {
      cy.get('[id="localPoliceForceId"]').clear().type('Met')
      cy.contains('Metropolitan').click({ force: true })
    },
    enterLocalPoliceForceId: nameSubString => {
      cy.get('[id="localPoliceForceId"]')
        .clear()
        .type(nameSubString || 'Met')
    },
  })

module.exports = { verifyOnPage: recallPrisonPolicePage }
