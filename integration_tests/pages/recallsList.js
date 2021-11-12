const page = require('./page')

const recallsListPage = () =>
  page('Recalls', {
    results: () => cy.get('[data-qa=search-results]'),
    clickCompletedTab: () => cy.get('#tab_completed').click(),
    expectActionLinkText: ({ id, text }) =>
      cy.get(`[data-qa=${id}]`).should($results => expect($results.text().trim()).to.equal(text)),
    continueBooking: ({ recallId }) => cy.get(`[data-qa=continue-booking-${recallId}]`).click(),
    assessRecall: ({ recallId }) => cy.get(`[data-qa=assess-recall-${recallId}]`).click(),
    continueAssessment: ({ recallId }) => cy.get(`[data-qa=continue-assess-${recallId}]`).click(),
    createDossier: ({ recallId }) => cy.get(`[data-qa=create-dossier-${recallId}]`).click(),
    continueDossier: ({ recallId }) => cy.get(`[data-qa=continue-dossier-${recallId}]`).click(),
    viewRecall: ({ recallId }) => cy.get(`[data-qa=view-recall-${recallId}]`).click(),
    expectRecallsSortOrder: listOfDates => {
      cy.get(`[data-qa="dueDate"]`).each(($result, index) => expect($result).to.contain(listOfDates[index]))
    },
  })

module.exports = { verifyOnPage: recallsListPage }
