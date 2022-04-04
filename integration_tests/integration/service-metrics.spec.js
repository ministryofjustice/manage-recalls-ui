import getServiceMetricsResponseJson from '../../fake-manage-recalls-api/stubs/__files/get-summary-statistics.json'

describe('Service metrics', () => {
  beforeEach(() => {
    cy.login()
  })

  it('shows the service metrics dashboard', () => {
    cy.task('expectGetServiceMetrics', { expectedResults: getServiceMetricsResponseJson })
    cy.visit('/service-metrics')
    cy.pageHeading().should('equal', 'Service metrics')
    cy.definitionListValue('timings-lastSevenDays', 'Book (5)').should('equal', '1m 40s')
    cy.definitionListValue('timings-lastSevenDays', 'Total').should('equal', '4m 05s')
    cy.definitionListValue('timings-overall', 'Create dossier (5)').should('equal', '1m 13s')
    cy.definitionListValue('timings-overall', 'Total').should('equal', '4m 38s')
  })
})
