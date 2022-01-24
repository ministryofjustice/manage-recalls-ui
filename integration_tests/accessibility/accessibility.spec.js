import { getRecallResponse, getAllFieldsHistoryResponseJson } from '../mockApis/mockResponses'

const pa11yArgs = { runners: ['axe'], standard: 'WCAG2AA' }
const nomsNumber = 'A1234AA'
const recallId = '123'
const urls = [
  '/',
  `/find-person?nomsNumber=${nomsNumber}`,
  `/persons/${nomsNumber}/recalls/${recallId}/view-recall`,
  `/persons/${nomsNumber}/recalls/${recallId}/licence-name`,
  `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name`,
  `/persons/${nomsNumber}/recalls/${recallId}/custody-status`,
  `/persons/${nomsNumber}/recalls/${recallId}/request-received`,
  `/persons/${nomsNumber}/recalls/${recallId}/issues-needs`,
  `/persons/${nomsNumber}/recalls/${recallId}/last-release`,
  `/persons/${nomsNumber}/recalls/${recallId}/prison-police`,
  `/persons/${nomsNumber}/recalls/${recallId}/probation-officer`,
  `/persons/${nomsNumber}/recalls/${recallId}/upload-documents`,
  `/persons/${nomsNumber}/recalls/${recallId}/missing-documents`,
  `/persons/${nomsNumber}/recalls/${recallId}/change-history`,
  `/persons/${nomsNumber}/recalls/${recallId}/change-history/field?fieldName=authorisingAssistantChiefOfficer&fieldPath=probationInfo.authorisingAssistantChiefOfficer`,
]

context('Accessibility', () => {
  beforeEach(() => {
    cy.login()
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        inCustody: true,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'recall-request.eml',
          },
          {
            category: 'RECALL_NOTIFICATION_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: '2021-07-03 Phil Jones recall.msg',
          },
          {
            category: 'DOSSIER_EMAIL',
            documentId: '234-3455-8542-c3ac-8c963f66afa6',
            fileName: 'email.msg',
          },
          {
            category: 'MISSING_DOCUMENTS_EMAIL',
            documentId: '123',
            fileName: 'chase-documents.msg',
          },
        ],
      },
    })
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
  })

  urls.forEach(url => {
    it(`${url} passes the pa11y checks`, () => {
      cy.task('expectListRecalls', { expectedResults: [] })
      cy.visit(url)
      cy.pa11y(pa11yArgs)
    })
  })
})
