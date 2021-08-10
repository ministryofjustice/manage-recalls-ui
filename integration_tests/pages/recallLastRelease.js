const page = require('./page')

const recallLastReleasePage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`When was ${personName} last released from prison?`, {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/recall-type` : null,
    setReleasingPrison: () => {
      cy.get('[name="lastReleasePrison"]').type('Belmarsh')
    },
    setLastReleaseDate: () => {
      cy.get('[name="year"]').clear().type('2020')
      cy.get('[name="month"]').clear().type('05')
      cy.get('[name="day"]').clear().type('03')
    },
    clickContinue: () => {
      cy.get('[data-qa=continueButton]').click()
    },
    expectError: () => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Recommend a fixed recall length')
      })
    },
  })

module.exports = { verifyOnPage: recallLastReleasePage }
