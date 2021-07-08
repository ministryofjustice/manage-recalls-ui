const assessRecallPage = require('../pages/assessRecall')

context('Offender profile', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = '123ABC'

  it('User can assess a recall', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    expectSearchResultsFromManageRecallsApi(nomsNumber, [
      {
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1999-05-28',
      },
    ])
    cy.login()

    const assessRecall = assessRecallPage.verifyOnPage(nomsNumber)
    assessRecall.expectOffenderName('Bobby Badger')
  })

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }
})
