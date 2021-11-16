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
    showPreConsOptions: options => {
      cy.get(`[for=previousConvictionMainNameCategory]`).each(($result, index) =>
        expect($result).to.contain(options[index].label)
      )
      cy.get(`[name=previousConvictionMainNameCategory]`).each(($result, index) =>
        expect($result.val()).to.equal(options[index].value)
      )
    },
  })

module.exports = { verifyOnPage: recallPreConsNamePage }
