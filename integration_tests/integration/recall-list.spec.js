import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

const recallsListPage = require('../pages/recallsList')
const assessRecallPage = require('../pages/assessRecall')

context('Todo list of recalls', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  it('User can view a list of recalls and click through to a recall page', () => {
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
        },
      ],
    })
    cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })

    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectResultsCountText('1 new recall')
    recallsList.results().find('tr').should('have.length', 1)
    const firstResult = recallsList.results().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
    firstResult.get('[data-qa=recallId]').should('contain.text', recallId)
    recallsList.viewRecall()
    assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: 'Bobby Badger' })
  })
})
