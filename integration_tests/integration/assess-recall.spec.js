import { searchResponseJson } from '../mockApis/mockResponses'

const assessRecallPage = require('../pages/assessRecall')

context('Assess a recall', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = '123ABC'

  it('User can assess a recall', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponseJson })
    cy.login()

    const assessRecall = assessRecallPage.verifyOnPage(nomsNumber)
    assessRecall.expectOffenderName('Bobby Badger')
  })
})
