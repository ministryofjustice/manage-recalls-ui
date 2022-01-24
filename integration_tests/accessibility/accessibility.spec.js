import { getRecallResponse, getAllFieldsHistoryResponseJson } from '../mockApis/mockResponses'

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

//
// TODO:
// - Error messages - if they're all the same, just one example will do
// - Document change history
//

context('Accessibility', () => {
  beforeEach(() => {
    cy.login()

    const basicRecall = {
      recallId,
      nomsNumber,
      firstName: getRecallResponse.firstName,
      lastName: getRecallResponse.lastName,
    }

    cy.task('expectListRecalls', {
      expectedResults: [
        {
          ...basicRecall,
          status: 'BEING_BOOKED_ON',
        },
      ],
    })

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
    it(`${url} - a11y checks`, () => {
      cy.visit(url)
      cy.pa11y(pa11yArgs)
    })
  })
})
