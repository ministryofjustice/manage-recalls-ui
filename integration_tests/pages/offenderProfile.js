const page = require('./page')

const offenderProfilePage = nomsNumber =>
  page('Offender profile', {
    url: nomsNumber ? `/offender-profile?nomsNumber=${nomsNumber}` : null,
    createRecall: () => cy.get('[data-qa=createRecallButton]').click(),
    expectRecallIdConfirmation: recallId => {
      cy.get('[data-qa=recallId]').should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(recallId)
      })
    },
    generateRevocationOrder: () => cy.get('[data-qa=getRevocationOrderButton]').click(),
  })

module.exports = { verifyOnPage: offenderProfilePage }
