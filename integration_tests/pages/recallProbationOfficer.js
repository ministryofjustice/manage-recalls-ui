const page = require('./page')

const recallProbationOfficerPage = ({ recallId } = {}) =>
  page('Who recommended the recall?', {
    url: recallId ? `/recalls/${recallId}/probation-officer` : null,
    setProbationOfficerName: () => {
      cy.get('[name="probationOfficerName"]').type('Dave Angel')
    },
    setProbationOfficerEmail: email => {
      cy.get('[name="probationOfficerEmail"]').type(email || 'probation.office@justice.com')
    },
    setProbationOfficerPhoneNumber: phone => {
      cy.get('[name="probationOfficerPhoneNumber"]').type(phone || '07980345903')
    },
    setLocalDeliveryUnit: () => {
      cy.get('[id="localDeliveryUnit"]').clear().type('Centr')
      cy.contains('Central Audit Team').click()
    },
    setAssistantChiefOfficer: () => {
      cy.get('[name="authorisingAssistantChiefOfficer"]').type('Bob Monkfish')
    },
  })

module.exports = { verifyOnPage: recallProbationOfficerPage }
