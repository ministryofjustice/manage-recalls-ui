const page = require('./page')

const recallsListPage = () =>
  page('To do', {
    results: () => cy.get('[data-qa=search-results]'),
    expectResultsCountText: expectedText => {
      cy.get('[data-qa=recalls-list-heading]').should($results => {
        const text = $results.text()
        expect(text.trim()).to.equal(expectedText)
      })
    },
    expectActionLinkText: ({ id, text }) => {
      cy.get(`[data-qa=${id}]`).should($results => expect($results.text().trim()).to.equal(text))
    },
    continueBooking: ({ recallId }) => cy.get(`[data-qa=continue-booking-${recallId}]`).click(),
    assessRecall: ({ recallId }) => cy.get(`[data-qa=assess-recall-${recallId}]`).click(),
    continueAssessment: ({ recallId }) => cy.get(`[data-qa=continue-assess-${recallId}]`).click(),
    createDossier: ({ recallId }) => cy.get(`[data-qa=create-dossier-${recallId}]`).click(),
    viewRecall: ({ recallId }) => cy.get(`[data-qa=view-recall-${recallId}]`).click(),
  })

module.exports = { verifyOnPage: recallsListPage }
