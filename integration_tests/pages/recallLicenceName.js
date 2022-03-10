const page = require('./page')

const recallLicenceNamePage = ({ recallId, personName } = {}) =>
  page(`How does ${personName}'s name appear on the licence?`, {
    url: recallId ? `/recalls/${recallId}/licence-name` : null,
    selectMiddleName: () => {
      cy.get('[id="licenceNameCategory-2"]').click()
    },
    showPreConsOptions: options => {
      cy.get(`[for=licenceNameCategory]`).each(($result, index) => expect($result).to.contain(options[index].label))
      cy.get(`[name=licenceNameCategory]`).each(($result, index) =>
        expect($result.val()).to.equal(options[index].value)
      )
    },
  })

module.exports = { verifyOnPage: recallLicenceNamePage }
