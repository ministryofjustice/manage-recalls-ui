import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import recallsListPage from '../pages/recallsList'
import assessRecallPage from '../pages/assessRecall'
import dossierRecallInformationPage from '../pages/dossierRecallInformation'
import recallInformationPage from '../pages/recallInformation'

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

  it('User can continue a previous booking if recall status is null', () => {
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

  it('User can move on to assessRecall if the recall has status BOOKED_ON', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'BOOKED_ON',
          recallAssessmentDueDateTime: '2021-11-05T13:12:10.000Z',
          recallEmailReceivedDateTime: '2021-11-04T13:12:10.000Z',
        },
      ],
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `assess-recall-${recallId}`, text: 'Assess recall' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '5 November at 13:12' })
    recallsList.assessRecall({ recallId })
    assessRecallPage.verifyOnPage({ fullName: personName })
  })

  it('User can continue assessment if the recall has status IN_ASSESSMENT', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'IN_ASSESSMENT',
          recallAssessmentDueDateTime: '2021-10-12T14:30:52.000Z',
          recallEmailReceivedDateTime: '2021-10-13T14:30:52.000Z',
          assignee: '122',
          assigneeUserName: 'Jimmy Pud',
        },
      ],
    })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '12 October at 15:30' })
    recallsList.assertElementHasText({ qaAttr: 'assignedTo', textToFind: 'Jimmy Pud' })
    recallsList.expectActionLinkText({ id: `continue-assess-${recallId}`, text: 'Continue assessment' })
    recallsList.continueAssessment({ recallId })
    assessRecallPage.verifyOnPage({ fullName: personName })
  })

  it('User can move on to createDossier if the recall has status RECALL_NOTIFICATION_ISSUED', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'RECALL_NOTIFICATION_ISSUED',
          dossierTargetDate: '2021-10-13',
        },
      ],
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `create-dossier-${recallId}`, text: 'Create dossier' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '13 October' })
    recallsList.createDossier({ recallId })
    dossierRecallInformationPage.verifyOnPage({ personName })
  })

  it('User can continue dossier creation if the recall has status DOSSIER_IN_PROGRESS', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'DOSSIER_IN_PROGRESS',
          dossierTargetDate: '2021-10-13',
          assignee: '122',
          assigneeUserName: 'Jimmy Pud',
        },
      ],
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-dossier-${recallId}`, text: 'Continue dossier creation' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '13 October' })
    recallsList.assertElementHasText({ qaAttr: 'assignedTo', textToFind: 'Jimmy Pud' })
    recallsList.continueDossier({ recallId })
    dossierRecallInformationPage.verifyOnPage({ personName })
  })

  it('User can move on to view recall if the recall has status DOSSIER_ISSUED', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'DOSSIER_ISSUED',
        },
      ],
    })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '' })
    recallsList.viewRecall({ recallId })
    recallInformationPage.verifyOnPage({ personName })
  })
})
