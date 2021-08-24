const page = require('./page')

const recallPrisonPolicePage = ({ nomsNumber, recallId } = {}) =>
  page('What are the police contact details?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/prison-police` : null,
    setlocalPoliceForce: () => {
      cy.get('[name="localPoliceForce"]').type('Essex')
    },
    expectError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Local police force')
      })
    },
  })

module.exports = { verifyOnPage: recallPrisonPolicePage }
