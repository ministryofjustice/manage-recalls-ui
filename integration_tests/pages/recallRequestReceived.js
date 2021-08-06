const page = require('./page')

const recallRequestReceivedPage = (params = {}) =>
  page('When did you receive the recall request?', {
    url: params.nomsNumber ? `/persons/${params.nomsNumber}/recalls/${params.recallId}/request-received` : null,
    enterRecallReceivedDate: values => {
      Object.keys(values).forEach(value => {
        cy.get(`[name=${value}]`).type(values[value])
      })
    },
    clickContinue: () => {
      cy.get('[data-qa=continueButton]').click()
    },
    expectError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Date and time you received the recall email')
      })
    },
  })

module.exports = { verifyOnPage: recallRequestReceivedPage }
