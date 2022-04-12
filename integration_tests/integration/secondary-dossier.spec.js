import { DateTime } from 'luxon'
import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
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

  it('prepare the secondary dossier', () => {
    const fiveDaysTime = DateTime.now().plus({ days: 5 })
    const twentyDaysTime = DateTime.now().plus({ days: 20 })
    const twentyDaysTimeFormatted = formatDateTimeFromIsoString({
      isoDate: twentyDaysTime,
      dateOnly: true,
    })
    const recall = {
      ...getEmptyRecallResponse,
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
    cy.task('expectUpdateRecall', { recallId })
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
    cy.clickLink('Prepare and send dossier')
    // legal rep
    cy.getLinkHref('Back').should('contain', `/recalls/${recallId}/secondary-dossier-recall`)
    const {
      fullName: legalRepName,
      email: legalRepEmail,
      phoneNumber: legalRepPhone,
    } = getRecallResponse.legalRepresentativeInfo
    cy.fillInput('Name', legalRepName)
    cy.fillInput('Email address', legalRepEmail)
    cy.fillInput('Phone number', legalRepPhone)
    cy.clickButton('Continue')
    // senior probation officer
    cy.getLinkHref('Back').should('contain', `/recalls/${recallId}/secondary-dossier-legal-rep`)
    const {
      fullName: probationOfficerName,
      email: probationOfficerEmail,
      phoneNumber: probationOfficerPhone,
      functionalEmail,
    } = getRecallResponse.seniorProbationOfficerInfo
    cy.fillInput('Name', probationOfficerName)
    cy.fillInput('Email address', probationOfficerEmail)
    cy.fillInput('Phone number', probationOfficerPhone)
    cy.fillInput('Probation functional email address', functionalEmail)
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, status: 'SECONDARY_DOSSIER_IN_PROGRESS' },
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('contain', `View the recall`)
    // view recall
    cy.getText('legalRepresentativeInfo_fullName').should('equal', legalRepName)
    cy.getText('legalRepresentativeInfo_email').should('equal', legalRepEmail)
    cy.getText('legalRepresentativeInfo_phoneNumber').should('equal', legalRepPhone)
    cy.getLinkHref('Change legal representative details').should(
      'contain',
      `/recalls/${recallId}/secondary-dossier-legal-rep?fromPage=view-recall&fromHash=legalRep`
    )
    cy.getText('seniorProbationOfficerInfo_fullName').should('equal', probationOfficerName)
    cy.getText('seniorProbationOfficerInfo_email').should('equal', probationOfficerEmail)
    cy.getLinkHref({ qaAttr: 'seniorProbationOfficerInfo_email' }).should('equal', `mailto:${probationOfficerEmail}`)
    cy.getText('seniorProbationOfficerInfo_phoneNumber').should('equal', probationOfficerPhone)
    cy.getText('seniorProbationOfficerInfo_functionalEmail').should('equal', functionalEmail)
    cy.getLinkHref({ qaAttr: 'seniorProbationOfficerInfo_functionalEmail' }).should(
      'equal',
      `mailto:${functionalEmail}`
    )
    cy.getLinkHref('Change Senior Probation Officer details').should(
      'contain',
      `/recalls/${recallId}/secondary-dossier-probation?fromPage=view-recall&fromHash=probation`
    )
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
    cy.clickButton('Continue dossier preparation for Ben Adams')
    cy.pageHeading().should('equal', `Prepare and send dossier for Ben Adams recall`)
    // check that user was assigned to recall
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/assignee/${caseworker.uuid}`,
      method: 'POST',
      bodyValues: {},
    })
  })

  it('errors - legal rep details', () => {
    cy.task('expectGetRecall', { expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.visitRecallPage({ pageSuffix: 'secondary-dossier-legal-rep' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'legalRepresentativeInfo_fullName',
      summaryError: 'Enter a name',
    })
    cy.assertErrorMessage({
      fieldName: 'legalRepresentativeInfo_email',
      summaryError: 'Enter an email',
    })
    cy.assertErrorMessage({
      fieldName: 'legalRepresentativeInfo_phoneNumber',
      summaryError: 'Enter a phone number',
    })
  })

  it('errors - senior probation officer details', () => {
    cy.task('expectGetRecall', { expectedResult: { ...getEmptyRecallResponse, recallId } })
    cy.visitRecallPage({ pageSuffix: 'secondary-dossier-probation' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'seniorProbationOfficerInfo_fullName',
      summaryError: 'Enter a name',
    })
    cy.assertErrorMessage({
      fieldName: 'seniorProbationOfficerInfo_email',
      summaryError: 'Enter an email',
    })
    cy.assertErrorMessage({
      fieldName: 'seniorProbationOfficerInfo_phoneNumber',
      summaryError: 'Enter a phone number',
    })
    cy.assertErrorMessage({
      fieldName: 'seniorProbationOfficerInfo_functionalEmail',
      summaryError: 'Enter a probation functional email address',
    })
  })

  it('populates legal rep form with saved values', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, status: 'SECONDARY_DOSSIER_IN_PROGRESS' },
    })
    cy.visitRecallPage({ pageSuffix: 'secondary-dossier-legal-rep' })
    const { fullName, email, phoneNumber } = getRecallResponse.legalRepresentativeInfo
    cy.getTextInputValue('Name').should('equal', fullName)
    cy.getTextInputValue('Email').should('equal', email)
    cy.getTextInputValue('Phone number').should('equal', phoneNumber)
  })

  it('populates senior probation officer form with saved values', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, status: 'SECONDARY_DOSSIER_IN_PROGRESS' },
    })
    cy.visitRecallPage({ pageSuffix: 'secondary-dossier-probation' })
    const { fullName, email, phoneNumber, functionalEmail } = getRecallResponse.seniorProbationOfficerInfo
    cy.getTextInputValue('Name').should('equal', fullName)
    cy.getTextInputValue('Email').should('equal', email)
    cy.getTextInputValue('Phone number').should('equal', phoneNumber)
    cy.getTextInputValue('Probation functional email address').should('equal', functionalEmail)
  })
})
