import { searchResponse } from '../mockApis/mockResponses'

const offenderProfilePage = require('../pages/offenderProfile')

context('Offender profile', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'

  it('User can create a recall', () => {
    const recallId = '123'
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.login()

    const offenderProfile = offenderProfilePage.verifyOnPage(nomsNumber)
    offenderProfile.createRecall()
    offenderProfile.expectRecallIdConfirmation(`Recall ID: ${recallId}`)
  })
})
