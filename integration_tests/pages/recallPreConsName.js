const page = require('./page')

const recallPreConsNamePage = ({ recallId, personName } = {}) =>
  page(`How does ${personName}'s name appear on the previous convictions sheet (pre-cons)?`, {
    url: recallId ? `/recalls/${recallId}/pre-cons-name` : null,
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
