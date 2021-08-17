const page = require('./page')

const recallLastReleasePage = ({ nomsNumber, recallId, personName } = {}) =>
  page(`When was ${personName} last released from prison?`, {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/last-release` : null,
    setReleasingPrison: value => {
      cy.get('[name="lastReleasePrison"]').type(value)
    },
    setLastReleaseDate: values => {
      Object.keys(values).forEach(value => {
        cy.get(`[name=${value}]`).clear().type(values[value])
      })
    },
    clearReleasingDate: () => {
      cy.get('[name="day"]').clear()
      cy.get('[name="month"]').clear()
      cy.get('[name="year"]').clear()
    },
    clickContinue: () => {
      cy.get('[data-qa=continueButton]').click()
    },
    expectError: fieldName => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal('Latest release date')
      })
      cy.get(`#${fieldName}-error`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.contain('Enter a valid date in the past')
      })
    },
  })

module.exports = { verifyOnPage: recallLastReleasePage }
