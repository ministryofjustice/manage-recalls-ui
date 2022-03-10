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
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    const rescind = getRecallResponse.rescindRecords[0]
    cy.task('expectAddRescindRequestRecord')
    cy.visitRecallPage({ recallId, pageSuffix: 'assess' })
    cy.clickButton('Actions')
    cy.clickLink('Rescind recall')
    cy.pageHeading().should('equal', 'Record a rescind request')
    cy.fillInput('Provide details about the rescind request', rescind.requestDetails)
    cy.enterDateTime(rescind.requestEmailReceivedDate)
    cy.uploadEmail({ field: 'rescindRequestEmailFileName' })

    // view rescind details
    const requestEmailId = '789'
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        rescindRecords: [
          {
            requestEmailId,
            requestEmailFileName: 'rescind-request.msg',
            requestEmailReceivedDate: '2020-12-08',
            requestDetails: 'Rescind was requested by email',
          },
        ],
      },
    })
    cy.clickButton('Save and return')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/rescind-records`,
      method: 'POST',
      bodyValues: {
        details: rescind.requestDetails,
        emailReceivedDate: rescind.requestEmailReceivedDate,
        emailFileName: 'email.msg',
        emailFileContent: '*',
      },
    })
    cy.pageHeading().should('equal', `Assess a recall for ${personName}`)
    cy.clickLink('View')
    cy.getText('recallStatus').should('equal', 'Rescind in progress')
    cy.recallInfo('Rescind request details').should('equal', rescind.requestDetails)
    cy.recallInfo('Rescind request received').should('equal', formatIsoDate(rescind.requestEmailReceivedDate))
    cy.recallInfo('Rescind request email').should('equal', rescind.requestEmailFileName)
    cy.getLinkHref(rescind.requestEmailFileName).should('contain', `/recalls/${recallId}/documents/${requestEmailId}`)
  })

  it('record a rescind decision', () => {
    const rescind = getRecallResponse.rescindRecords[0]
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        rescindRecords: [
          {
            rescindRecordId: '123',
            requestEmailId: '123',
            requestEmailFileName: 'rescind-request.msg',
            requestEmailReceivedDate: '2020-12-08',
            requestDetails: 'Rescind was requested by email',
          },
        ],
      },
    })
    cy.task('expectUpdateRescindRequestRecord')
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-recall' })
    cy.clickButton('Actions')
    cy.clickLink('Update rescind')
    cy.pageHeading().should('equal', 'Record the rescind decision')
    cy.selectRadio('Do you want to rescind this recall?', 'Yes')
    cy.fillInput('Provide details about the decision', rescind.decisionDetails)
    cy.selectCheckboxes('I have sent the email to all relevant recipients', [
      'I have sent the email to all relevant recipients',
    ])
    cy.enterDateTime(rescind.decisionEmailSentDate)
    cy.uploadEmail({ field: 'rescindDecisionEmailFileName' })

    // view rescind details
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'STOPPED',
      },
    })
    cy.clickButton('Save and return')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/rescind-records/${rescind.rescindRecordId}`,
      method: 'PATCH',
      bodyValues: {
        approved: true,
        details: rescind.decisionDetails,
        emailSentDate: rescind.decisionEmailSentDate,
        emailFileName: 'email.msg',
        emailFileContent: '*',
      },
    })
    cy.pageHeading().should('equal', `Create a dossier for ${personName} recall`)
    cy.clickLink('View')
    cy.getText('recallStatus').should('equal', 'Stopped')
    cy.recallInfo('Recall rescinded').should('equal', 'Yes')
    cy.recallInfo('Rescind decision details').should('equal', rescind.decisionDetails)
    cy.recallInfo('Rescind decision sent').should('equal', formatIsoDate(rescind.decisionEmailSentDate))
    cy.recallInfo('Rescind decision email').should('equal', rescind.decisionEmailFileName)
    cy.getLinkHref(rescind.decisionEmailFileName).should(
      'contain',
      `/recalls/${recallId}/documents/${rescind.decisionEmailId}`
    )
  })

  it('errors - rescind request', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'rescind-request' })
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
