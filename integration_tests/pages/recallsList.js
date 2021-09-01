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
    assessRecall: ({ recallId }) => cy.get(`[data-qa=assess-recall-${recallId}]`).click(),
    createDossier: ({ recallId }) => cy.get(`[data-qa=create-dossier-${recallId}]`).click(),
  })

module.exports = { verifyOnPage: recallsListPage }
