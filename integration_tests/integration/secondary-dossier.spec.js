import { DateTime } from 'luxon'
import { getRecallResponse } from '../mockApis/mockResponses'
import { formatDateTimeFromIsoString } from '../../server/controllers/utils/dates/format'
import { caseworker } from '../fixtures/caseworker'

context('Secondary dossier', () => {
  const recallId = '86954'

  beforeEach(() => {
    cy.login()
  })

  it('shows if recall status is "Ready for review" on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, status: 'AWAITING_SECONDARY_DOSSIER_CREATION' },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.getText('recallStatus').should('equal', 'Ready for review')
  })

  it('can verify recall details before preparing the secondary dossier', () => {
    const fiveDaysTime = DateTime.now().plus({ days: 5 })
    const twentyDaysTime = DateTime.now().plus({ days: 20 })
    const twentyDaysTimeFormatted = formatDateTimeFromIsoString({
      isoDate: twentyDaysTime,
      dateOnly: true,
    })
    const recall = {
      ...getRecallResponse,
      recallId,
      firstName: 'Ben',
      lastName: 'Adams',
      status: 'AWAITING_SECONDARY_DOSSIER_CREATION',
      secondaryDossierDueDate: twentyDaysTime.toISODate(),
    }
    const recalls = [
      {
        ...getRecallResponse,
        recallId: '1',
        firstName: 'Jack',
        lastName: 'Jones',
        status: 'AWAITING_SECONDARY_DOSSIER_CREATION',
        secondaryDossierDueDate: fiveDaysTime.toISODate(),
        assignee: '123',
        assigneeUserName: 'Mary Badger',
      },
      {
        ...getRecallResponse,
        recallId: '2',
        status: 'AWAITING_PART_B',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
      },
      recall,
    ]

    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.task('expectAssignUserToRecall', { expectedResult: recall })
    cy.task('expectGetRecall', {
      expectedResult: { ...recall, status: 'SECONDARY_DOSSIER_IN_PROGRESS' },
    })
    cy.visit('/')
    cy.clickLink('Dossier check (2)')
    cy.clickButton('Prepare dossier for Ben Adams')
    cy.getText('recallStatus').should('equal', 'Preparation in progress')
    cy.getText('secondaryDossierDueDate').should('contain', `Dossier will be due on ${twentyDaysTimeFormatted}`)
    // check that user was assigned to recall
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/assignee/${caseworker.uuid}`,
      method: 'POST',
      bodyValues: {},
    })
  })

  it('continue dossier preparation if it has previously been started', () => {
    const recall = {
      recallId,
      status: 'SECONDARY_DOSSIER_IN_PROGRESS',
      firstName: 'Ben',
      lastName: 'Adams',
    }
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...getRecallResponse,
          ...recall,
        },
      ],
    })
    cy.task('expectGetRecall', { expectedResult: { ...getRecallResponse, ...recall } })
    cy.task('expectAssignUserToRecall', { expectedResult: recall })
    cy.visit('/')
    cy.clickLink('Dossier check (1)')
    cy.clickButton(`Continue dossier preparation for Ben Adams`)
    cy.pageHeading().should('equal', `Prepare and send dossier for Ben Adams recall`)
    // check that user was assigned to recall
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/assignee/${caseworker.uuid}`,
      method: 'POST',
      bodyValues: {},
    })
  })
})
