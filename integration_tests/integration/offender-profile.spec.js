import { searchResponse } from '../mockApis/mockResponses'

const offenderProfilePage = require('../pages/offenderProfile')
const newRecallPage = require('../pages/newRecall')

context('Offender profile', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'

  it('User can create a recall', () => {
    const recallId = '123'
    const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { recallId, expectedResult: { recallId } })
    cy.login()

    const offenderProfile = offenderProfilePage.verifyOnPage({ nomsNumber, personName })
    offenderProfile.createRecall()
    const newRecall = newRecallPage.verifyOnPage()
    newRecall.expectRecallIdConfirmation(recallId)
  })
})
