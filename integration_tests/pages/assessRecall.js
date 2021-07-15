const page = require('./page')

const assessRecallPage = recallId =>
  page(/Assess .+ recall/, {
    url: recallId ? `/assess-recall?recallId=${recallId}` : null,
    expectOffenderName: offenderName => {
      cy.get('[data-qa=offenderName]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(offenderName)
      })
    },
    getRevocationOrder: () => cy.get('[data-qa=getRevocationOrderButton]').click(),
  })

module.exports = { verifyOnPage: assessRecallPage }
