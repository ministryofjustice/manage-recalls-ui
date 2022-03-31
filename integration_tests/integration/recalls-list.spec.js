import { DateTime } from 'luxon'
import { getRecallResponse } from '../mockApis/mockResponses'
import userDetailsPage from '../pages/userDetails'

describe('Recalls list', () => {
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
  it("redirected to user details page if they haven't entered any", () => {
    cy.task('expectGetCurrentUserDetails', { status: 404 })
    cy.visit('/')
    userDetailsPage.verifyOnPage()
  })

  it('continue a previous booking if recall status is BEING_BOOKED_ON', () => {
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
    cy.pageHeading().should('equal', 'Recalls')
    cy.getLinkHref(`Continue booking for ${personName}`).should(
      'contain',
      `/recalls/${recallId}/licence-name?returnToRecallList=1`
    )
    cy.getLinkHref(`View recall for ${personName}`).should('contain', `/recalls/${recallId}/view-recall`)
  })

  it('continue a previous booking to pre-cons page if the user has no middle names', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...basicRecall,
          middleNames: '',
          status: 'BEING_BOOKED_ON',
        },
      ],
    })
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, middleNames: '', status: 'BEING_BOOKED_ON' } })
    cy.visit('/')
    cy.getLinkHref(`Continue booking for ${personName}`).should(
      'contain',
      `/recalls/${recallId}/pre-cons-name?returnToRecallList=1`
    )
  })

  it('move on to assessRecall if the recall has status BOOKED_ON', () => {
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
    cy.task('expectAddPhaseStartTime')
    cy.visit('/')
    cy.assertTableColumnValues({
      qaAttrTable: 'to-do',
      qaAttrCell: 'dueDate',
      valuesToCompare: ['5 Nov at 13:12'],
    })
    cy.clickButton(`Assess recall for ${personName}`)
    cy.pageHeading().should('equal', `Assess a recall for ${personName}`)
  })

  it('continue assessment if the recall has status IN_ASSESSMENT', () => {
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
    cy.assertTableColumnValues({
      qaAttrTable: 'to-do',
      qaAttrCell: 'assignedTo',
      valuesToCompare: ['Jimmy Pud'],
    })
    cy.getLinkHref(`Continue assessment for ${personName}`).should('contain', `/recalls/${recallId}/assess`)
  })

  it('move on to createDossier if the recall has status AWAITING_DOSSIER_CREATION', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...basicRecall,
          status: 'AWAITING_DOSSIER_CREATION',
          dossierTargetDate: '2021-10-13',
          inCustodyAtBooking: true,
        },
      ],
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: { ...getRecallResponse, status: 'AWAITING_DOSSIER_CREATION' },
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectAddPhaseStartTime')
    cy.visit('/')
    cy.clickButton(`Create dossier for ${personName}`)
    cy.pageHeading().should('equal', `Create a dossier for ${personName} recall`)
  })

  it('continue dossier creation if the recall has status DOSSIER_IN_PROGRESS', () => {
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
    cy.assertTableColumnValues({
      qaAttrTable: 'to-do',
      qaAttrCell: 'dueDate',
      valuesToCompare: ['13 Oct'],
    })
    cy.getLinkHref(`Continue dossier creation for ${personName}`).should(
      'contain',
      `/recalls/${recallId}/dossier-recall`
    )
  })

  it('see recalls are ordered by due date on the todo list, and table can be re-sorted', () => {
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
        status: 'AWAITING_DOSSIER_CREATION',
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
    cy.assertTableColumnValues({
      qaAttrTable: 'to-do',
      qaAttrCell: 'dueDate',
      valuesToCompare: ['', '', '10 Dec at 15:33', '6 May at 16:33', '15 Aug', '15 Aug'],
    })
    cy.clickButton('Due')
    cy.assertTableColumnValues({
      qaAttrTable: 'to-do',
      qaAttrCell: 'dueDate',
      valuesToCompare: ['15 Aug', '15 Aug', '6 May at 16:33', '10 Dec at 15:33', '', ''],
    })
  })

  it('see recalls are ordered by date on the completed list, and table can be re-sorted', () => {
    const stoppedRecallId = '987'
    const recalls = [
      {
        ...basicRecall,
        recallId: stoppedRecallId,
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
    cy.clickLink('Completed')
    cy.getLinkHref(`View recall for ${personName}`).should('contain', `/recalls/${stoppedRecallId}/view-recall`)
    cy.assertTableColumnValues({
      qaAttrTable: 'completed',
      qaAttrCell: 'completedDate',
      valuesToCompare: ['4 May 2021', '22 October 2020'],
    })
    cy.clickButton('Date', { parent: '#completed' })
    cy.assertTableColumnValues({
      qaAttrTable: 'completed',
      qaAttrCell: 'completedDate',
      valuesToCompare: ['22 October 2020', '4 May 2021'],
    })
  })

  it('lists "not in custody" recalls on a separate tab, and table can be re-sorted', () => {
    const assessedRecallId = '2'
    const awaitingReturnRecallId = '3'
    const recalls = [
      {
        ...getRecallResponse,
        recallId: '1',
        firstName: 'Jack',
        lastName: 'Jones',
        status: 'BOOKED_ON',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '123',
        assigneeUserName: 'Mary Badger',
      },
      {
        ...getRecallResponse,
        recallId: assessedRecallId,
        status: 'ASSESSED_NOT_IN_CUSTODY',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
      },
      {
        ...getRecallResponse,
        recallId: awaitingReturnRecallId,
        firstName: 'Ben',
        lastName: 'Adams',
        status: 'AWAITING_RETURN_TO_CUSTODY',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
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
    cy.getLinkHref('Add warrant reference').should('equal', `/recalls/${assessedRecallId}/warrant-reference`)
    cy.getLinkHref('Add RTC date').should('equal', `/recalls/${awaitingReturnRecallId}/rtc-dates`)
    cy.clickButton('Status', { parent: '#notInCustody' })
    cy.assertTableColumnValues({
      qaAttrTable: 'notInCustody',
      qaAttrCell: 'status',
      valuesToCompare: ['Awaiting return to custody', 'Assessment complete'],
    })
  })

  it('lists "awaiting part B" recalls on a separate tab, and table can be re-sorted', () => {
    const assessedRecallId = '2'
    const awaitingReturnRecallId = '3'
    const yesterday = DateTime.now().minus({ days: 2 }).toISODate()
    const tomorrow = DateTime.now().plus({ days: 1 }).toISODate()
    const recalls = [
      {
        ...getRecallResponse,
        recallId: '1',
        firstName: 'Jack',
        lastName: 'Jones',
        status: 'BOOKED_ON',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '123',
        assigneeUserName: 'Mary Badger',
      },
      {
        ...getRecallResponse,
        recallId: assessedRecallId,
        status: 'AWAITING_PART_B',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        partBDueDate: tomorrow,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
      },
      {
        ...getRecallResponse,
        recallId: awaitingReturnRecallId,
        firstName: 'Ben',
        lastName: 'Adams',
        status: 'AWAITING_PART_B',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        partBDueDate: yesterday,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
      },
    ]

    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.visit('/')
    cy.clickLink('Awaiting part B (2)')
    cy.assertTableColumnValues({
      qaAttrTable: 'awaitingPartB',
      qaAttrCell: 'due',
      valuesToCompare: ['Overdue', 'Tomorrow'],
    })
    cy.clickButton('Due', { parent: '#awaitingPartB' })
    cy.assertTableColumnValues({
      qaAttrTable: 'awaitingPartB',
      qaAttrCell: 'due',
      valuesToCompare: ['Tomorrow', 'Overdue'],
    })
  })
})
