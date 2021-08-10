const page = require('./page')

const recallPrisonPolicePage = ({ nomsNumber, recallId } = {}) =>
  page('What are the police contact details?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/prison-police` : null,
    setLocalPoliceService: () => {
      cy.get('[name="localPoliceService"]').type('Brentwood')
    },
    clickContinue: () => {
      cy.get('[data-qa=continueButton]').click()
    },
    expectError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Local police station')
      })
    },
  })

module.exports = { verifyOnPage: recallPrisonPolicePage }
