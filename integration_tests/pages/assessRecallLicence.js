const page = require('./page')

const assessRecallLicencePage = ({ nomsNumber, recallId } = {}) =>
  page('How has the licence been breached?', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-licence` : null,
    enterLicenceConditionsBreached: () =>
      cy.get('[name="licenceConditionsBreached"]').clear().type('(i) one\n(ii) two'),
    checkReasonsRecalled: () => {
      cy.get(`[value="${'ELM_FAILURE_CHARGE_BATTERY'}"]`).check()
      cy.get(`[value="${'OTHER'}"]`).check()
      cy.get('[name="reasonsForRecallOtherDetail"]').clear().type('Other reason')
    },
  })

module.exports = { verifyOnPage: assessRecallLicencePage }
