context('Error pages', () => {
  beforeEach(() => {
    cy.login()
  })

  it('server error', () => {
    cy.task('expectListRecalls', {
      statusCode: 500,
    })
    cy.visit('/', { failOnStatusCode: false })
    cy.getElement('Sorry, there is a problem with the service').should('exist')
  })

  it('page not found', () => {
    cy.visit('/blah', { failOnStatusCode: false })
    cy.getElement('Page not found').should('exist')
  })
})
