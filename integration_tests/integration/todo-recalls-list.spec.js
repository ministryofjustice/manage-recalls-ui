import { searchResponse } from '../mockApis/mockResponses'
import recallsListPage from '../pages/recallsList'
import assessRecallPage from '../pages/assessRecall'
import dossierLetterPage from '../pages/dossierLetter'

const recallPreConsNamePage = require('../pages/recallPreConsName')

context('To do (recalls) list', () => {
  const recallId = '123'
  const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.task('expectGetRecall', { recallId, expectedResult: { recallId, documents: [] } })
  })

  const nomsNumber = 'A1234AA'

  it('User can continue a previous booking', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
        },
      ],
    })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-booking-${recallId}`, text: 'Continue booking' })
    recallsList.continueBooking({ recallId })
    recallPreConsNamePage.verifyOnPage({ personName })
  })

  it('User can assess a recall', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'BOOKED_ON',
        },
      ],
    })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `assess-recall-${recallId}`, text: 'Assess recall' })
    recallsList.assessRecall({ recallId })
    assessRecallPage.verifyOnPage({ fullName: personName })
  })

  it('User can create a dossier', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'RECALL_NOTIFICATION_ISSUED',
        },
      ],
    })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `create-dossier-${recallId}`, text: 'Create dossier' })
    recallsList.createDossier({ recallId })
    dossierLetterPage.verifyOnPage()
  })
})
