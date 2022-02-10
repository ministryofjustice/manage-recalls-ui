import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import { formatIsoDate } from '../support/utils'

context('Rescind a recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.lastName}`

  beforeEach(() => {
    cy.login()
  })

  it('can request a rescind', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'RECALL_NOTIFICATION_ISSUED',
      },
    })
    const rescind = getRecallResponse.rescindRecords[0]
    cy.task('expectAddRescindRequestRecord')
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'assess' })
    cy.clickButton('Actions')
    cy.clickLink('Rescind recall')
    cy.pageHeading().should('equal', 'Record a rescind request')
    cy.fillInput('Provide details about the rescind request', rescind.requestDetails)
    cy.clickButton('Today')
    cy.uploadEmail({ field: 'rescindRequestEmailFileName' })

    // view rescind details
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
      },
    })
    cy.clickButton('Save and return')
    cy.pageHeading().should('equal', `Assess a recall for ${personName}`)
    cy.clickLink('View')
    cy.recallInfo('Rescind request details').should('equal', rescind.requestDetails)
    cy.recallInfo('Rescind request received').should('equal', formatIsoDate(rescind.requestEmailReceivedDate))
    cy.recallInfo('Rescind request email').should('equal', rescind.requestEmailFileName)
  })

  it('errors - rescind request', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'RECALL_NOTIFICATION_ISSUED',
      },
    })
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'rescind-request' })
    cy.clickButton('Save and return')
    cy.assertErrorMessage({
      fieldName: 'rescindRequestDetail',
      summaryError: 'Provide more detail',
    })
    cy.assertErrorMessage({
      fieldName: 'rescindRequestEmailReceivedDate',
      summaryError: 'Enter the date you received the rescind request email',
    })
    cy.assertErrorMessage({
      fieldName: 'rescindRequestEmailFileName',
      summaryError: 'Select an email',
    })
  })
})
