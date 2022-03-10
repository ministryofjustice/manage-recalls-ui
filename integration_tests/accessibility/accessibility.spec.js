import { getEmptyRecallResponse } from '../mockApis/mockResponses'

const pa11yArgs = { runners: ['axe'], standard: 'WCAG2AA', hideElements: '.govuk-footer' }

const nomsNumber = 'A1234AA'
const recallId = '123'
const urls = [
  '/',
  '/user-details',
  `/find-person?nomsNumber=${nomsNumber}`,
  `/recalls/${recallId}/assess-confirmation`,
  `/recalls/${recallId}/assess-download`,
  `/recalls/${recallId}/assess`,
  `/recalls/${recallId}/change-history/document?category=PART_A_RECALL_REPORT`,
  `/recalls/${recallId}/change-history/field?fieldName=authorisingAssistantChiefOfficer&fieldPath=probationInfo.authorisingAssistantChiefOfficer`,
  `/recalls/${recallId}/change-history`,
  `/recalls/${recallId}/check-answers`,
  `/recalls/${recallId}/confirmation`,
  `/recalls/${recallId}/custody-status`,
  `/recalls/${recallId}/dossier-confirmation`,
  `/recalls/${recallId}/dossier-recall`,
  `/recalls/${recallId}/issues-needs`,
  `/recalls/${recallId}/last-known-address`,
  `/recalls/${recallId}/last-release`,
  `/recalls/${recallId}/licence-name`,
  `/recalls/${recallId}/missing-documents`,
  `/recalls/${recallId}/pre-cons-name`,
  `/recalls/${recallId}/prison-police`,
  `/recalls/${recallId}/probation-officer`,
  `/recalls/${recallId}/request-received`,
  `/recalls/${recallId}/upload-documents`,
  `/recalls/${recallId}/view-recall`,
]

context('Accessibility (a11y) Checks', () => {
  beforeEach(() => {
    cy.stubRecallsAndLogin()
  })

  urls.forEach(url => {
    it(url, () => {
      cy.visit(url)
      cy.pa11y(pa11yArgs)
    })
  })

  it('error state (using /issues-needs as the example)', () => {
    cy.task('expectGetRecall', { expectedResult: { recallId: '123', ...getEmptyRecallResponse } })
    cy.visit(`/recalls/${recallId}/issues-needs`)
    cy.clickButton('Continue')
    cy.pa11y(pa11yArgs)
  })
})
