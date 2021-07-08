const page = require('./page')

const offenderProfilePage = nomsNumber =>
  page(/Assess .+ recall/, {
    url: nomsNumber ? `/assess-recall?nomsNumber=${nomsNumber}` : null,
    expectOffenderName: offenderName => {
      cy.get('[data-qa=offenderName]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(offenderName)
      })
    },
  })

module.exports = { verifyOnPage: offenderProfilePage }
