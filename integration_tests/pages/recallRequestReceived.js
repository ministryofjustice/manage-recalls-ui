const page = require('./page')

const recallRequestReceivedPage = (params = {}) =>
  page('When did you receive the recall request?', {
    url: params.nomsNumber ? `/persons/${params.nomsNumber}/recalls/${params.recallId}/request-received` : null,
    expectError: fieldName => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Date and time you received the recall email')
      })
      cy.get(`#${fieldName}-error`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.contain('Enter a valid date and time in the past')
      })
    },
  })
module.exports = { verifyOnPage: recallRequestReceivedPage }
