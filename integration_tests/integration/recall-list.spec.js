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
    recallsList.expectResultsCountText('1 recall')
    recallsList.results().find('tr').should('have.length', 1)
    const firstResult = recallsList.results().first()
    firstResult.get('[data-qa=name]').should('contain.text', 'Bobby Badger')
    recallsList.assessRecall({ recallId })
    assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: 'Bobby Badger' })
  })
})
