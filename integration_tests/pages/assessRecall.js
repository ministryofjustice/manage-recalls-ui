const page = require('./page')

const assessRecallPage = ({ nomsNumber, recallId, fullName }) =>
  page(fullName, {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess` : null,
    expectRecallLength: value => {
      cy.get('[data-qa=recallLength]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(value)
      })
    },
    expectUploadedDocument: ({ category, label }) => {
      cy.get(`[data-qa=uploadedDocument-${category}]`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(label)
      })
    },
    clickContinue: () => cy.get('[data-qa=continueButton]').click(),
  })

module.exports = { verifyOnPage: assessRecallPage }
