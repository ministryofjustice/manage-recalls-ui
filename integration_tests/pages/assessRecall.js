const page = require('./page')

const assessRecallPage = ({ nomsNumber, recallId, fullName }) =>
  page(fullName, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess` : null,
    expectRecallId: recall => {
      cy.get('[data-qa=recallId]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(recall)
      })
    },
    expectRecallLength: value => {
      cy.get('[data-qa=recallLength]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(value)
      })
    },
    getRevocationOrder: () => cy.get('[data-qa=getRevocationOrderButton]').click(),
    expectUploadedDocument: ({ category, label }) => {
      cy.get(`[data-qa=uploadedDocument-${category}]`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(label)
      })
    },
  })

module.exports = { verifyOnPage: assessRecallPage }
