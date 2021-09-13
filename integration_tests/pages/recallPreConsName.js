const page = require('./page')

const recallPreConsNamePage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`What is the main name on ${personName}'s pre-cons?`, {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name` : null,
    selectOtherName: () => {
      cy.get('[id="hasOtherPreviousConvictionMainName-2"]').click()
    },
    enterOtherName: name => {
      cy.get('[name="previousConvictionMainName"]').clear().type(name)
    },
  })

module.exports = { verifyOnPage: recallPreConsNamePage }
