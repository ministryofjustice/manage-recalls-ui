const page = require('./page')

const addRecallTypePage = ({ nomsNumber, recallId }) =>
  page('Recall recommendation', {
    url: `/persons/${nomsNumber}/recalls/${recallId}/recall-type`,
    addRecallType: () => cy.get('[data-qa=addRecallTypeButton]').click(),
    expectPersonNameInCaption: personName => {
      cy.get('[data-qa=addRecallTypeCaption]').should($results => {
        const text = $results.text()
        expect(text.trim()).to.contain(personName)
      })
    },
  })

module.exports = { verifyOnPage: addRecallTypePage }
