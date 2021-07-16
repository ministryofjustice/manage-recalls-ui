import { searchResponse } from '../mockApis/mockResponses'

const recallsListPage = require('../pages/recallsList')

context('Todo list of recalls', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  it('User can view a list of recalls', () => {
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          id: '1',
          nomsNumber,
        },
      ],
    })

    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectResultsCountText('1 new recall')
    recallsList.results().find('tr').should('have.length', 1)
    const firstResult = recallsList.results().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
  })
})
