const page = require('./page')

const recallProbationOfficerPage = ({ nomsNumber, recallId } = {}) =>
  page('Who recommended the recall?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/probation-officer` : null,
    setProbationOfficerName: () => {
      cy.get('[name="probationOfficerName"]').type('Dave Angel')
    },
    setProbationOfficerEmail: () => {
      cy.get('[name="probationOfficerEmail"]').type('probation.office@justice.com')
    },
    setProbationOfficerPhoneNumber: () => {
      cy.get('[name="probationOfficerPhoneNumber"]').type('07980345903')
    },
    setLocalDeliveryUnit: () => {
      cy.get('[id="localDeliveryUnit"]').clear().type('PS - Br')
      cy.contains('PS - Brent').click()
    },
    setAssistantChiefOfficer: () => {
      cy.get('[name="authorisingAssistantChiefOfficer"]').type('Bob Monkfish')
    },
  })

module.exports = { verifyOnPage: recallProbationOfficerPage }
