import { getEmptyRecallResponse } from '../mockApis/mockResponses'

context('Standard / fixed term recall type', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const emptyRecall = {
    ...getEmptyRecallResponse,
    status: 'IN_ASSESSMENT',
    recallId,
  }

  beforeEach(() => {
    cy.login()
  })

  it('confirm recall type when assessing recall', () => {
    // confirm a standard recall
    cy.task('expectGetRecall', {
      expectedResult: { ...emptyRecall, recommendedRecallType: 'STANDARD' },
    })
    cy.task('expectSetConfirmedRecallType')
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.visitRecallPage({ recallId, pageSuffix: 'assess-decision' })
    cy.selectRadio(
      'Do you agree with the standard recall recommendation?',
      'Yes, proceed with the recommended standard recall'
    )
    cy.fillInput('Provide more detail', 'No evidence that the recommendation was wrong')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'How has the licence been breached?')

    // upgrade fixed term recall to standard
    cy.task('expectGetRecall', {
      expectedResult: { ...emptyRecall, recommendedRecallType: 'FIXED', recallLength: 'FOURTEEN_DAYS' },
    })
    cy.clickLink('Back')
    cy.task('expectSetConfirmedRecallType')
    cy.visitRecallPage({ recallId, pageSuffix: 'assess-decision' })
    cy.selectRadio('Do you agree with the fixed term 14 day recall recommendation?', 'No, upgrade to a standard recall')
    cy.fillInput('Provide more detail', 'Disagree', {
      parent: '#conditional-confirmedRecallType-2',
    })
    cy.uploadEmail({ field: 'confirmedRecallTypeEmailFileName', file: 'email.msg' })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'How has the licence been breached?')

    // downgrade standard recall to fixed term
    cy.task('expectGetRecall', {
      expectedResult: { ...emptyRecall, recommendedRecallType: 'STANDARD' },
    })
    cy.clickLink('Back')
    cy.task('expectSetConfirmedRecallType')
    cy.visitRecallPage({ recallId, pageSuffix: 'assess-decision' })
    cy.selectRadio('Do you agree with the standard recall recommendation?', 'No, downgrade to a fixed term recall')
    cy.fillInput('Provide more detail', 'Disagree', {
      parent: '#conditional-confirmedRecallType-2',
    })
    cy.uploadEmail({ field: 'confirmedRecallTypeEmailFileName', file: 'email.msg' })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'How has the licence been breached?')
  })

  it('errors - confirm recall type', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...emptyRecall, recommendedRecallType: 'FIXED', recallLength: 'FOURTEEN_DAYS' },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'assess-decision' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'confirmedRecallType',
      summaryError: 'Do you agree with the recall recommendation?',
    })

    // if they don't add detail on their decision
    cy.selectRadio('Do you agree with the fixed term 14 day recall recommendation?', 'No, upgrade to a standard recall')
    cy.clickButton('Continue')
    cy.getRadioOptionByLabel(
      'Do you agree with the fixed term 14 day recall recommendation?',
      'No, upgrade to a standard recall'
    ).should('be.checked')
    cy.assertErrorMessage({
      fieldName: 'confirmedRecallTypeDetailStandard',
      summaryError: 'Provide more detail',
    })
  })

  it('shows recall type of standard on dossier check page, and hides recall length', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        confirmedRecallType: 'STANDARD',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-check' })
    cy.recallInfo('Recall type').should('equal', 'Standard')
    cy.getElement('recallLength').should('not.exist')
  })

  it('shows recall type of fixed on dossier check page, and shows recall length', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        confirmedRecallType: 'FIXED',
        recallLength: 'TWENTY_EIGHT_DAYS',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-check' })
    cy.recallInfo('Recall type').should('equal', 'Fixed term')
    cy.recallInfo('Recall length').should('equal', '28 days')
  })

  it('shows recommended standard recall on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        recommendedRecallType: 'STANDARD',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Recall type').should('equal', 'Standard')
    cy.getElement('Recall length').should('not.exist')
    cy.getElement('Change recall type').should('not.exist')
  })

  it('shows recommended and confirmed standard recall on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        recommendedRecallType: 'STANDARD',
        confirmedRecallType: 'STANDARD',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Recall type').should('equal', 'Standard')
    cy.getElement('Recall length').should('not.exist')
    cy.getElement('Change recall type').should('not.exist')
  })

  it('shows recommended and confirmed fixed recall on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        recommendedRecallType: 'FIXED',
        confirmedRecallType: 'FIXED',
        recallLength: 'TWENTY_EIGHT_DAYS',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Recall type').should('equal', 'Fixed term')
    cy.recallInfo('Recall length').should('equal', '28 days')
  })

  it('shows recommended standard recall and downgraded fixed term recall on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        recommendedRecallType: 'STANDARD',
        confirmedRecallType: 'FIXED',
        confirmedRecallTypeDetail: 'Disagree with standard',
        recallLength: 'FOURTEEN_DAYS',
        documents: [
          {
            documentId: 'ea443809-4b29-445a-8c36-3ff259f48b03',
            category: 'CHANGE_RECALL_TYPE_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Recommended recall type').should('equal', 'Standard')
    cy.recallInfo('Downgraded recall type').should('equal', 'Fixed term')
    cy.recallInfo('Downgraded recall length').should('equal', '14 days')
    cy.recallInfo('Downgraded recall detail').should('equal', 'Disagree with standard')
    cy.recallInfo('Downgraded recall email').should('equal', 'email.msg')
  })

  it('shows recommended fixed term recall and upgraded standard recall on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        recallId,
        recommendedRecallType: 'FIXED',
        confirmedRecallType: 'STANDARD',
        confirmedRecallTypeDetail: 'Disagree with fixed',
        recallLength: 'FOURTEEN_DAYS',
        documents: [
          {
            documentId: 'ea443809-4b29-445a-8c36-3ff259f48b03',
            category: 'CHANGE_RECALL_TYPE_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Recommended recall type').should('equal', 'Fixed term')
    cy.recallInfo('Recommended recall length').should('equal', '14 days')
    cy.recallInfo('Upgraded recall type').should('equal', 'Standard')
    cy.recallInfo('Upgraded recall detail').should('equal', 'Disagree with fixed')
    cy.recallInfo('Upgraded recall email').should('equal', 'email.msg')
  })
})
