import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallLastRelease'
import uploadDocumentsPage from '../pages/uploadDocuments'
import assessRecallPage from '../pages/assessRecall'

const offenderProfilePage = require('../pages/offenderProfile')
const recallRequestReceivedPage = require('../pages/recallRequestReceived')

context('Book a recall', () => {
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
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, recallId } })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.login()
    const offenderProfile = offenderProfilePage.verifyOnPage({ nomsNumber, personName })
    offenderProfile.createRecall()
    recallRequestReceived = recallRequestReceivedPage.verifyOnPage()
  })

  const nomsNumber = 'A1234AA'

  it('User can book a recall', () => {
    recallRequestReceived.enterRecallReceivedDate({ day: '10', month: '05', year: '2021', hour: '05', minute: '3' })
    recallRequestReceived.clickContinue()
    const recallLastRelease = recallLastReleasePage.verifyOnPage({ personName })
    recallLastRelease.setReleasingPrison()
    recallLastRelease.setLastReleaseDate()
    recallLastRelease.clickContinue()
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.upload()
    assessRecallPage.verifyOnPage({ fullName: 'Bobby Badger' })
  })

  it('User sees an error if an invalid email received date is entered', () => {
    recallRequestReceived.enterRecallReceivedDate({ year: '2021', hour: '05', minute: '3' })
    recallRequestReceived.clickContinue()
    recallRequestReceived.expectError()
  })
})
