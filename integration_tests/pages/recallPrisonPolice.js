const page = require('./page')

const recallPrisonPolicePage = ({ nomsNumber, recallId } = {}) =>
  page('What is the name of the local police force?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/prison-police` : null,
    setlocalPoliceForce: () => {
      cy.get('[name="localPoliceForce"]').type('Essex')
    },
  })

module.exports = { verifyOnPage: recallPrisonPolicePage }
