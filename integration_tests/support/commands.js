import 'cypress-file-upload'

Cypress.Commands.add('login', () => {
  cy.request(`/`)
  cy.task('getLoginUrl').then(cy.visit)
})

Cypress.Commands.add('pageHeading', () =>
  cy
    .get('h1')
    .invoke('text')
    .then(text => text.trim())
)

Cypress.Commands.add('getRowValuesFromTable', ({ rowQaAttr }, opts = {}) =>
  cy
    .get(opts.parent || 'body')
    .find(`[data-qa="${rowQaAttr}"]`)
    .find('.govuk-table__cell')
    .then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)

// =============================== NAVIGATE ===============================

const clickElement = (label, tagName, opts = { parent: 'body' }) => {
  if (label.qaAttr) {
    cy.get(opts.parent).find(`${tagName}[data-qa="${label.qaAttr}"]`).click()
  } else {
    cy.get(opts.parent).find(tagName).contains(label).click()
  }
}

Cypress.Commands.add('clickButton', (label, opts = { parent: 'body' }) => clickElement(label, 'button', opts))

// ============================ RADIO BUTTONS ===============================

Cypress.Commands.add('selectRadio', (groupLabel, value, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      if (opts.findByValue) {
        cy.wrap($fieldset).find(`[value=${value}]`).check()
      } else {
        cy.wrap($fieldset).contains('label', value).click()
      }
    })
})

Cypress.Commands.add('assertErrorMessage', ({ fieldName, summaryError, fieldError }) => {
  cy.get(`[href="#${fieldName}"]`).should('have.text', summaryError)
  cy.get(`#${fieldName}-error`).should($searchResults => {
    const text = $searchResults.text()
    expect(text.trim()).to.contain(fieldError || summaryError)
  })
})
