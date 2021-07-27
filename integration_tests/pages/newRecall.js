const page = require('./page')

const newRecallPage = (params = {}) =>
  page('Book a recall', {
    url: params.nomsNumber ? `/persons/${params.nomsNumber}/recalls/${params.recallId}` : null,
    expectRecallIdConfirmation: recallId => {
      cy.get('[data-qa=recallId]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(recallId)
      })
    },
  })

module.exports = { verifyOnPage: newRecallPage }
