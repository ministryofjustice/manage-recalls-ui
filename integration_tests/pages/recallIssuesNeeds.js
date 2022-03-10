const page = require('./page')

const recallIssuesNeedsPage = ({ recallId } = {}) =>
  page('Are there any issues or needs?', {
    url: recallId ? `/recalls/${recallId}/issues-needs` : null,
    setVulnerabilityDiversityNo: () => {
      cy.get('[id="vulnerabilityDiversity-2"]').click()
    },
    setContrabandNo: () => {
      cy.get('[id="contraband-2"]').click()
    },
    setVulnerabilityDiversityYes: () => {
      cy.get('[id="vulnerabilityDiversity"]').click()
    },
    setContrabandYes: () => {
      cy.get('[id="contraband"]').click()
    },
    setMappaLevel: () => {
      cy.get('[id="mappaLevel"]').select('Not known')
    },
  })

module.exports = { verifyOnPage: recallIssuesNeedsPage }
