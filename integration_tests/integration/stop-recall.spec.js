import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import { formatIsoDate, getReferenceDataItemLabel } from '../support/utils'
import { recall } from '../fixtures'

context('Stop a recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.lastName}`

  beforeEach(() => {
    cy.login()
  })

  it('can stop a recall', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'BOOKED_ON',
      },
    })
    cy.task('expectStopRecall')
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.clickButton('Actions')
    cy.clickLink('Stop recall')
    cy.pageHeading().should('equal', 'Why are you stopping this recall?')
    cy.selectFromDropdown('Why are you stopping this recall?', recall.stopReason)

    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        ...recall,
        recallId,
        status: 'STOPPED',
      },
    })
    cy.clickButton('Save and return')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/stop`,
      method: 'POST',
      bodyValues: {
        stopReason: recall.stopReason,
      },
    })
    cy.pageHeading().should('equal', `View the recall for ${personName}`)
    cy.getText('recallStatus').should('equal', 'Stopped')
    // Stop recall link no longer available under Actions menu
    cy.getElement('Stop recall').should('not.exist')
    cy.getText('confirmation').should('equal', 'Recall stopped.')
    cy.clickLink('View')
    cy.recallInfo('Reason recall stopped').should('equal', getReferenceDataItemLabel('stopReasons', recall.stopReason))
    cy.recallInfo('Recall stopped by').should('equal', getRecallResponse.stopByUserName)
    cy.recallInfo('Recall stopped on').should('equal', formatIsoDate(getRecallResponse.stopDateTime))
  })

  it('errors - stop recall', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'stop-recall' })
    cy.clickButton('Save and return')
    cy.assertErrorMessage({
      fieldName: 'stopReason',
      summaryError: 'Why are you stopping this recall?',
    })
  })
})
