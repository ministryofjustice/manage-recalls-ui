const page = require('./page')

const recallIssuesNeedsPage = ({ nomsNumber, recallId } = {}) =>
  page('Are there any issues or needs?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/issues-needs` : null,
    setVulnerabilityDiversityNo: () => {
      cy.get('[id="vulnerabilityDiversity-2"]').click()
    },
    setContrabandNo: () => {
      cy.get('[id="contraband-2"]').click()
    },
    setMappaLevel: () => {
      cy.get('[id="mappaLevel"]').select('Not known')
    },
  })

module.exports = { verifyOnPage: recallIssuesNeedsPage }
