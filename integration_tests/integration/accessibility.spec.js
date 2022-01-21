import {
  getRecallResponse,
  getPrisonerResponse,
  getLocalDeliveryUnitsResponse,
  getPrisonsResponse,
  getCourtsResponse,
} from '../mockApis/mockResponses'

const pa11yArgs = { standard: 'WCAG2AA' }
const nomsNumber = 'A1234AA'
const recallId = '123'
const status = 'BOOKED_ON'
const urls = ['/', `/find-person?nomsNumber=${nomsNumber}`, `/persons/${nomsNumber}/recalls/${recallId}/pre-cons-name`]

context('Accessibility', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
        },
      ],
    })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'BOOKED_ON',
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
            version: 1,
          },
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          },
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'recall-request.eml',
          },
        ],
      },
    })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectUnassignAssessment', { expectedResult: getRecallResponse })
    cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
  })

  urls.forEach(url => {
    it(`${url} passes the pa11y checks`, () => {
      cy.task('expectListRecalls', { expectedResults: [] })
      cy.login()
      cy.visit(url)
      cy.pa11y(pa11yArgs)
    })
  })
})
