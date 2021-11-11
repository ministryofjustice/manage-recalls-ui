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
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
  })

  const nomsNumber = 'A1234AA'

  it('User can continue a previous booking if recall status is BEING_BOOKED_ON', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status: 'BEING_BOOKED_ON',
        },
      ],
    })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, status: 'BEING_BOOKED_ON' } })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-booking-${recallId}`, text: 'Continue booking' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
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
          recallAssessmentDueDateTime: '2020-11-05T13:12:10.000Z',
          recallEmailReceivedDateTime: '2020-11-04T13:12:10.000Z',
        },
      ],
    })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, status: 'BOOKED_ON' } })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `assess-recall-${recallId}`, text: 'Assess recall' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '5 Nov at 13:12' })
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
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, status: 'IN_ASSESSMENT' } })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '12 Oct at 15:30' })
    recallsList.assertElementHasText({ qaAttr: 'assignedTo', textToFind: 'Jimmy Pud' })
    recallsList.expectActionLinkText({ id: `continue-assess-${recallId}`, text: 'Continue assessment' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
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
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: { ...getRecallResponse, status: 'RECALL_NOTIFICATION_ISSUED' },
    })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `create-dossier-${recallId}`, text: 'Create dossier' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '13 Oct' })
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
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, status: 'DOSSIER_IN_PROGRESS' } })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-dossier-${recallId}`, text: 'Continue dossier creation' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '13 Oct' })
    recallsList.assertElementHasText({ qaAttr: 'assignedTo', textToFind: 'Jimmy Pud' })
    recallsList.continueDossier({ recallId })
    const dossierRecallInfo = dossierRecallInformationPage.verifyOnPage({ personName })
    dossierRecallInfo.assertElementHasText({ qaAttr: 'differentNomsNumber', textToFind: 'AC3408303' })
    dossierRecallInfo.assertElementPresent({ qaAttr: 'licenceConditionsBreached' })
    dossierRecallInfo.assertElementPresent({ qaAttr: 'assessedByUserName' })
  })

  it('User can move on to view recall if the recall has status DOSSIER_ISSUED', () => {
    const recalls = [
      {
        recallId: '123445-5717-4562-b3fc-2c963f66afa6',
        nomsNumber,
        status: 'STOPPED',
        lastUpdatedDateTime: '2020-10-22T18:33:57.000Z',
      },
      {
        recallId,
        nomsNumber,
        status: 'DOSSIER_ISSUED',
        dossierEmailSentDate: '2021-05-04',
      },
    ]
    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, status: 'DOSSIER_ISSUED' } })
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.clickCompletedTab()
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    cy.get(`[data-qa="completedDate"]`)
      .eq(0)
      .should($results => expect($results.text().trim()).to.equal('4 May 2021'))
    cy.get(`[data-qa="completedDate"]`)
      .eq(1)
      .should($results => expect($results.text().trim()).to.equal('22 October 2020'))
    recallsList.viewRecall({ recallId })
    recallInformationPage.verifyOnPage({ personName })
  })
})
