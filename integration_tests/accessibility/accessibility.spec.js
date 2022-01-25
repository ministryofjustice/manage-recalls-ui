import { getEmptyRecallResponse } from '../mockApis/mockResponses'

const pa11yArgs = { runners: ['axe'], standard: 'WCAG2AA', hideElements: '.govuk-footer' }

const nomsNumber = 'A1234AA'
const recallId = '123'
const urls = [
  '/',
  '/user-details',
  `/find-person?nomsNumber=${nomsNumber}`,
  `/persons/${nomsNumber}/recalls/${recallId}/assess-confirmation`,
  `/persons/${nomsNumber}/recalls/${recallId}/assess-download`,
  `/persons/${nomsNumber}/recalls/${recallId}/assess`,
  `/persons/${nomsNumber}/recalls/${recallId}/change-history/document?category=PART_A_RECALL_REPORT`,
  `/persons/${nomsNumber}/recalls/${recallId}/change-history/field?fieldName=authorisingAssistantChiefOfficer&fieldPath=probationInfo.authorisingAssistantChiefOfficer`,
  `/persons/${nomsNumber}/recalls/${recallId}/change-history`,
  `/persons/${nomsNumber}/recalls/${recallId}/check-answers`,
  `/persons/${nomsNumber}/recalls/${recallId}/confirmation`,
  `/persons/${nomsNumber}/recalls/${recallId}/custody-status`,
  `/persons/${nomsNumber}/recalls/${recallId}/dossier-confirmation`,
  `/persons/${nomsNumber}/recalls/${recallId}/dossier-recall`,
  `/persons/${nomsNumber}/recalls/${recallId}/issues-needs`,
  `/persons/${nomsNumber}/recalls/${recallId}/last-known-address`,
  `/persons/${nomsNumber}/recalls/${recallId}/last-release`,
  `/persons/${nomsNumber}/recalls/${recallId}/licence-name`,
  `/persons/${nomsNumber}/recalls/${recallId}/missing-documents`,
  `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name`,
  `/persons/${nomsNumber}/recalls/${recallId}/prison-police`,
  `/persons/${nomsNumber}/recalls/${recallId}/probation-officer`,
  `/persons/${nomsNumber}/recalls/${recallId}/request-received`,
  `/persons/${nomsNumber}/recalls/${recallId}/upload-documents`,
  `/persons/${nomsNumber}/recalls/${recallId}/view-recall`,
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
    cy.visit(`/persons/${nomsNumber}/recalls/${recallId}/issues-needs`)
    cy.clickButton('Continue')
    cy.pa11y(pa11yArgs)
  })
})
