import 'cypress-file-upload'

Cypress.Commands.add('login', () => {
  cy.request(`/`)
  cy.task('getLoginUrl').then(cy.visit)
})

Cypress.Commands.add('getRowValuesFromTable', ({ rowQaAttr }, opts = {}) =>
  cy
    .get(opts.parent || 'body')
    .find(`[data-qa="${rowQaAttr}"]`)
    .find('.govuk-table__cell')
    .then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)
