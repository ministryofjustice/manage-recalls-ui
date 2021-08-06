import { searchResponse } from '../mockApis/mockResponses'
import addRecallTypePage from '../pages/addRecallType'

const offenderProfilePage = require('../pages/offenderProfile')
const recallRequestReceivedPage = require('../pages/recallRequestReceived')

context('Create a recall', () => {
  const recallId = '123'
  const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
  let recallRequestReceived

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { recallId, expectedResult: { recallId, documents: [] } })
    cy.task('expectUpdateRecall', recallId)
    cy.login()
    const offenderProfile = offenderProfilePage.verifyOnPage({ nomsNumber, personName })
    offenderProfile.createRecall()
    recallRequestReceived = recallRequestReceivedPage.verifyOnPage()
  })

  const nomsNumber = 'A1234AA'

  it('User can create a recall', () => {
    recallRequestReceived.enterRecallReceivedDate({ day: '10', month: '05', year: '2021', hour: '05', minute: '3' })
    recallRequestReceived.clickContinue()
    addRecallTypePage.verifyOnPage()
  })

  it('User sees an error if an invalid date is entered', () => {
    recallRequestReceived.enterRecallReceivedDate({ year: '2021', hour: '05', minute: '3' })
    recallRequestReceived.clickContinue()
    recallRequestReceived.expectError()
  })
})
