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
    clickContinue: () => {
      cy.get('[data-qa=continueButton]').click()
    },
    expectVulnerabilityDiversityError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Vulnerability issues or diversity needs')
      })
    },
    expectContrabandError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Bring contraband to prison')
      })
    },
    expectMappaError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Select MAPPA level')
      })
    },
  })

module.exports = { verifyOnPage: recallIssuesNeedsPage }
