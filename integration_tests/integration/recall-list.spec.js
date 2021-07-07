const recallsListPage = require('../pages/recallsList')

context('Todo list of recalls', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = '123ABC'
  it('User can view a list of recalls', () => {
    expectSearchResultsFromManageRecallsApi(nomsNumber, [
      {
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1999-05-28',
      },
    ])
    expectRecallResultsFromManageRecallsApi([
      {
        id: '1',
        nomsNumber,
      },
    ])

    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectResultsCountText('1 new recall')
    recallsList.results().find('tr').should('have.length', 1)
    const firstResult = recallsList.results().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
  })

  function expectRecallResultsFromManageRecallsApi(expectedResults) {
    cy.task('expectListRecalls', { expectedResults })
  }

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }
})
