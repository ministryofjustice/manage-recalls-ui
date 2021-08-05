const page = require('./page')

const addRecallTypePage = ({ nomsNumber, recallId }) =>
  page('Recall recommendation', {
    url: `/persons/${nomsNumber}/recalls/${recallId}/recall-type`,
    setRecallLength: () => {
      cy.get('[value="FOURTEEN_DAYS"]').click()
    },
    clickContinue: () => {
      cy.get('[data-qa=continueButton]').click()
    },
    expectPersonNameInCaption: personName => {
      cy.get('[data-qa=addRecallTypeCaption]').should($results => {
        const text = $results.text()
        expect(text.trim()).to.contain(personName)
      })
    },
    expectError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Recommend a fixed recall length')
      })
    },
  })

module.exports = { verifyOnPage: addRecallTypePage }
