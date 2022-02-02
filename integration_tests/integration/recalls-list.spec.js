import { getRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'
import recallsListPage from '../pages/recallsList'
import assessRecallPage from '../pages/assessRecall'
import dossierRecallInformationPage from '../pages/dossierRecallInformation'
import recallInformationPage from '../pages/recallInformation'
import userDetailsPage from '../pages/userDetails'

describe('To do (recalls) list', () => {
  const recallId = '123'
  const nomsNumber = 'A1234AA'
  const basicRecall = {
    recallId,
    nomsNumber,
    firstName: getRecallResponse.firstName,
    lastName: getRecallResponse.lastName,
    middleNames: getRecallResponse.middleNames,
  }
  const personName = `${basicRecall.firstName} ${basicRecall.lastName}`

  beforeEach(() => {
    cy.login()
  })
  it("user is redirected to user details page if they haven't entered any", () => {
    cy.task('expectGetCurrentUserDetails', { status: 404 })
    cy.visit('/')
    userDetailsPage.verifyOnPage()
  })

  it('User can continue a previous booking if recall status is BEING_BOOKED_ON', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...basicRecall,
          status: 'BEING_BOOKED_ON',
        },
      ],
    })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, status: 'BEING_BOOKED_ON' } })
    cy.visit('/')
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-booking-${recallId}`, text: 'Continue booking' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.continueBooking({ recallId })
    cy.pageHeading().should('equal', `How does ${personName}'s name appear on the licence?`)
  })

  it('User will continue a previous booking to pre-cons page if the user has no middle names', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...basicRecall,
          middleNames: '',
          status: 'BEING_BOOKED_ON',
        },
      ],
    })
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, status: 'BEING_BOOKED_ON' } })
    cy.visit('/')
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-booking-${recallId}`, text: 'Continue booking' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.continueBooking({ recallId })
    cy.pageHeading().should(
      'equal',
      `How does ${personName}'s name appear on the previous convictions sheet (pre-cons)?`
    )
  })

  it('User can move on to assessRecall if the recall has status BOOKED_ON', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...basicRecall,
          status: 'BOOKED_ON',
          recallAssessmentDueDateTime: '2020-11-05T13:12:10.000Z',
          recallEmailReceivedDateTime: '2020-11-04T13:12:10.000Z',
        },
      ],
    })
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, status: 'BOOKED_ON' } })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.visit('/')
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
          ...basicRecall,
          status: 'IN_ASSESSMENT',
          recallAssessmentDueDateTime: '2021-10-12T14:30:52.000Z',
          recallEmailReceivedDateTime: '2021-10-13T14:30:52.000Z',
          assignee: '122',
          assigneeUserName: 'Jimmy Pud',
        },
      ],
    })
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, status: 'IN_ASSESSMENT' } })
    cy.visit('/')
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
          ...basicRecall,
          status: 'RECALL_NOTIFICATION_ISSUED',
          dossierTargetDate: '2021-10-13',
        },
      ],
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: { ...getRecallResponse, status: 'RECALL_NOTIFICATION_ISSUED' },
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.visit('/')
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
          ...basicRecall,
          status: 'DOSSIER_IN_PROGRESS',
          dossierTargetDate: '2021-10-13',
          assignee: '122',
          assigneeUserName: 'Jimmy Pud',
        },
      ],
    })
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, status: 'DOSSIER_IN_PROGRESS' } })
    cy.visit('/')
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectActionLinkText({ id: `continue-dossier-${recallId}`, text: 'Continue dossier creation' })
    recallsList.expectActionLinkText({ id: `view-recall-${recallId}`, text: 'View recall' })
    recallsList.assertElementHasText({ qaAttr: 'dueDate', textToFind: '13 Oct' })
    recallsList.assertElementHasText({ qaAttr: 'assignedTo', textToFind: 'Jimmy Pud' })
    recallsList.continueDossier({ recallId })
    const dossierRecallInfo = dossierRecallInformationPage.verifyOnPage({ personName })
    dossierRecallInfo.assertElementPresent({ qaAttr: 'licenceConditionsBreached' })
    dossierRecallInfo.assertElementPresent({ qaAttr: 'assessedByUserName' })
  })

  it('User can move on to view recall if the recall has status DOSSIER_ISSUED', () => {
    const recalls = [
      {
        ...basicRecall,
        recallId: '123445-5717-4562-b3fc-2c963f66afa6',
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
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, status: 'DOSSIER_ISSUED' } })
    cy.visit('/')
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
    const recallInfo = recallInformationPage.verifyOnPage({ personName })
    recallInfo.assertElementHasText({ qaAttr: 'differentNomsNumber', textToFind: 'AC3408303' })
  })

  it('User can see recalls are ordered by due date on the todo list', () => {
    const recalls = [
      {
        ...basicRecall,
        recallId: '1',
        status: 'BOOKED_ON',
        createdDateTime: '2020-09-01T16:33:57.000Z',
        lastUpdatedDateTime: '2020-09-22T18:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '2',
        status: 'BEING_BOOKED_ON',
        createdDateTime: '2020-12-05T16:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '3',
        status: 'BEING_BOOKED_ON',
        createdDateTime: '2020-12-01T16:33:57.000Z',
        lastUpdatedDateTime: '2020-12-03T18:33:57.000Z',
        recallAssessmentDueDateTime: '2020-12-10T15:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '4',
        status: 'IN_ASSESSMENT',
        createdDateTime: '2020-05-05T16:33:57.000Z',
        lastUpdatedDateTime: '2020-05-07T18:33:57.000Z',
        recallAssessmentDueDateTime: '2021-05-06T15:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '5',
        status: 'DOSSIER_IN_PROGRESS',
        createdDateTime: '2020-08-05T16:33:57.000Z',
        lastUpdatedDateTime: '2020-08-16T18:33:57.000Z',
        recallAssessmentDueDateTime: '2020-08-14T15:33:57.000Z',
        dossierTargetDate: '2021-08-15T17:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '6',
        status: 'RECALL_NOTIFICATION_ISSUED',
        createdDateTime: '2021-08-05T16:33:57.000Z',
        lastUpdatedDateTime: '2021-08-16T18:33:57.000Z',
        recallAssessmentDueDateTime: '2021-08-14T15:33:57.000Z',
        dossierTargetDate: '2021-08-15T15:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '7',
        status: 'STOPPED',
        createdDateTime: '2020-10-05T16:33:57.000Z',
        lastUpdatedDateTime: '2020-10-22T18:33:57.000Z',
        recallAssessmentDueDateTime: '2020-10-23T15:33:57.000Z',
      },
      {
        ...basicRecall,
        recallId: '8',
        status: 'DOSSIER_ISSUED',
        createdDateTime: '2020-12-05T16:33:57.000Z',
        lastUpdatedDateTime: '2020-12-22T18:33:57.000Z',
        recallAssessmentDueDateTime: '2020-12-15T15:33:57.000Z',
        dossierTargetDate: '2020-12-16T15:33:57.000Z',
        dossierEmailSentDate: '2020-12-17T15:33:57.000Z',
      },
    ]
    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })

    cy.visit('/')
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.expectRecallsSortOrder(['', '', '10 Dec at 15:33', '6 May at 16:33', '15 Aug', '15 Aug'])
  })

  it('lists "not in custody" recalls on a separate tab', () => {
    const recalls = [
      {
        ...getRecallResponse,
        recallId: '1',
        firstName: 'Jack',
        lastName: 'Jones',
        status: 'BOOKED_ON',
        inCustody: false,
        assignee: '123',
        assigneeUserName: 'Mary Badger',
      },
      {
        ...getRecallResponse,
        recallId: '2',
        status: 'RECALL_NOTIFICATION_ISSUED',
        inCustody: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
      },
      {
        ...getRecallResponse,
        recallId: '3',
        firstName: 'Ben',
        lastName: 'Adams',
        status: 'RECALL_NOTIFICATION_ISSUED',
        inCustody: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
        warrantReferenceNumber: '04RC/6457367A74325',
      },
    ]

    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.visit('/')
    cy.clickLink('Not in custody (2)')
    cy.assertTableColumnValues({
      qaAttrTable: 'notInCustody',
      qaAttrCell: 'status',
      valuesToCompare: ['Assessment complete', 'Awaiting return to custody'],
    })
    cy.getLinkHref({ qaAttr: 'warrant-reference-2' }).should(
      'equal',
      `/persons/${nomsNumber}/recalls/2/warrant-reference`
    )
    cy.getElement({ qaAttr: 'warrant-reference-3' }).should('not.exist')
  })
})
