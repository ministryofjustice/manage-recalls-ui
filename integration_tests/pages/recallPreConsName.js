const page = require('./page')

const recallPreConsNamePage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`What is the main name on ${personName}'s pre-cons?`, {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name` : null,
    selectOtherName: () => {
      cy.get('[id="previousConvictionMainNameCategory-3"]').click()
    },
    enterOtherName: name => {
      cy.get('[name="previousConvictionMainName"]').clear().type(name)
    },
    showPreConsOptions: optionLabels => {
      cy.get(`[for=previousConvictionMainNameCategory]`).each(($result, index) =>
        expect($result).to.contain(optionLabels[index])
      )
    },
  })

module.exports = { verifyOnPage: recallPreConsNamePage }
