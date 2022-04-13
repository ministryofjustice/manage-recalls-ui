import { getRecallResponse, getEmptyRecallResponse } from '../mockApis/mockResponses'

import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'
import { stubRefData } from '../support/mock-api'

context('Primary dossier', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'AWAITING_DOSSIER_CREATION'
  const emptyRecall = { ...getEmptyRecallResponse, recallId }

  beforeEach(() => {
    cy.login()
  })

  it('can verify recall details before creating a dossier', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
            version: 2,
          },
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          },
          {
            category: 'REVOCATION_ORDER',
            documentId: '9876',
            fileName: 'BADGER BOBBY A123456 REVOCATION ORDER.pdf',
          },
          {
            category: 'RECALL_NOTIFICATION_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'notification.msg',
            createdDateTime: '2020-12-05T18:33:57.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'recall-request.eml',
            createdDateTime: '2020-12-05T18:33:57.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
        ],
        missingDocuments: {
          required: ['LICENCE'],
          desired: ['OASYS_RISK_ASSESSMENT'],
        },
        returnedToCustodyDateTime: undefined,
        returnedToCustodyNotificationDateTime: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-recall' })
    cy.getElement('Overdue: Due on 14 December 2020').should('exist')
    cy.getText('recallStatus').should('contain', 'Assessment complete')
    cy.recallInfo('Booking number').should('equal', 'A123456')
    cy.recallInfo('Recall assessed by').should('equal', 'Bertie Badger')

    // custody details
    cy.recallInfo('Custody status at booking').should('equal', 'Not in custody')
    cy.recallInfo('Custody status at assessment').should('equal', 'In custody')
    cy.getElement('Change custody status at booking').should('not.exist')
    cy.getElement('Change custody status at assessment').should('not.exist')
    cy.recallInfo('Prison held in').should('equal', 'Kennet (HMP)')

    // recall details
    cy.recallInfo('Recall email received').should('equal', '5 December 2020 at 15:33')
    cy.recallInfo('Recall email uploaded').should('equal', 'recall-request.eml')
    cy.recallInfo('Licence conditions breached').should('equal', '(i) one (ii) two')
    cy.getLinkHref('Change licence conditions breached').should('contain', '/assess-licence')
    cy.getLinkHref('Change reasons for recall').should('contain', '/assess-licence')
    cy.getText('reasonsForRecall-ELM_FAILURE_CHARGE_BATTERY').should(
      'contain',
      'Electronic locking and monitoring (ELM) - Failure to charge battery'
    )
    cy.getText('reasonsForRecall-OTHER').should('contain', 'Other - other reason detail...')
    cy.recallInfo('Recall notification email sent').should('equal', '15 August 2021 at 14:04')
    cy.recallInfo('Recall notification email uploaded').should('equal', 'notification.msg')
    cy.getLinkHref('Change recall notification email sent date').should('contain', '/assess-email')
    cy.getLinkHref('Change uploaded recall notification email').should('contain', '/assess-email')

    // revocation order
    cy.getLinkHref('BADGER BOBBY A123456 REVOCATION ORDER.pdf').should('contain', `/recalls/${recallId}/documents/9876`)
    cy.getLinkHref('Change Revocation order').should(
      'contain',
      '/generated-document-version?fromPage=dossier-recall&fromHash=revocation-order&versionedCategoryName=REVOCATION_ORDER'
    )

    // uploaded documents
    cy.getLinkHref('Part A.pdf').should('contain', `/recalls/${recallId}/documents/123`)
    cy.getLinkHref('Pre Cons.pdf').should('contain', `/recalls/${recallId}/documents/1234-5717-4562-b3fc-2c963f66afa6`)

    // change link for an uploaded document goes to the 'add new document version' page
    cy.getLinkHref('Change Part A recall report').should(
      'contain',
      '/recalls/123/upload-document-version?fromPage=dossier-recall&fromHash=uploaded-documents&versionedCategoryName=PART_A_RECALL_REPORT'
    )
    // missing documents
    cy.recallInfo('Licence').should('equal', 'Missing: needed to create dossier')
    cy.recallInfo('OASys report').should('equal', 'Missing')
    // disabled Create dossier button
    cy.getText('createDossierDisabled').should('contain', 'Create dossier')
  })

  it('can verify recall details before creating a dossier (not in custody)', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        documents: [],
        returnedToCustodyDateTime: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-recall' })
    cy.getText('inCustodyAtBooking').should('equal', 'Not in custody')
    cy.getText('inCustodyAtAssessment').should('equal', 'Not in custody')
    cy.getElement({ qaAttr: 'currentPrison' }).should('not.exist')
  })

  it('can create a dossier', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        hasDossierBeenChecked: undefined,
        recallId,
        status,
        bookingNumber: 'A123456',
        confirmedRecallType: 'FIXED',
        recallLength: 'FOURTEEN_DAYS',
        licenceConditionsBreached: '(i) one (ii) two',
        returnedToCustodyDateTime: undefined,
        returnedToCustodyNotificationDateTime: undefined,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
          },
          {
            category: 'LICENCE',
            documentId: '123',
          },
        ],
      },
    })
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    const fileName = 'email.msg'
    cy.task('expectGetRecallDocument', {
      category: 'DOSSIER_EMAIL',
      file: 'abc',
      fileName,
      documentId: '123',
    })
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
          inCustodyAtBooking: true,
        },
      ],
    })
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectUpdateRecall', { recallId, status })
    cy.task('expectAddPhaseStartTime')
    cy.task('expectAddPhaseEndTime')
    const firstLastName = 'Bobby Badger'
    cy.visit('/')
    cy.pageHeading().should('equal', 'Recalls')
    cy.clickButton('Create dossier')
    cy.pageHeading().should('equal', 'Create a dossier for Bobby Badger recall')
    cy.clickLink('Create dossier')
    cy.selectRadio('Are there additional licence conditions?', 'Yes')
    cy.fillInput('Provide more detail', 'Details', { parent: '#conditional-additionalLicenceConditions' })
    cy.selectRadio(`Is ${firstLastName} being held under a different NOMIS number to the one on the licence?`, 'Yes')
    cy.fillInput(`NOMIS number ${firstLastName} is being held under`, nomsNumber, {
      parent: '#conditional-differentNomsNumber',
    })
    cy.clickButton('Continue')
    cy.recallInfo('Name').should('equal', firstLastName)
    cy.recallInfo('NOMIS').should('equal', nomsNumber)
    cy.recallInfo('Booking number').should('equal', 'A123456')
    cy.recallInfo('Licence conditions breached').should('contain', '(i) one (ii) two')
    cy.recallInfo('Recall type').should('equal', 'Fixed term')
    cy.recallInfo('Recall length').should('equal', '14 days')
    cy.clickLink('Continue')
    cy.pageHeading().should('equal', 'Download the dossier and letter')
    cy.getLinkHref('Download the Dossier').should(
      'contain',
      `/recalls/${recallId}/documents/create?category=DOSSIER&pageSuffix=dossier-download`
    )
    cy.getText('getDossierFileName').should('equal', 'Filename: BADGER BOBBY A123456 RECALL DOSSIER.pdf')
    cy.getLinkHref('Download the Letter to prison').should(
      'contain',
      `/recalls/${recallId}/documents/create?category=LETTER_TO_PRISON&pageSuffix=dossier-download`
    )
    cy.getText('getLetterToPrisonFileName').should('equal', 'Filename: BADGER BOBBY A123456 LETTER TO PRISON.pdf')
    cy.selectConfirmationCheckbox('I have checked the information in the dossier and letter is correct')
    cy.clickButton('Continue')

    cy.selectConfirmationCheckbox('I have sent the email to all recipients')
    cy.clickButton('Set date to today')
    cy.uploadEmail({ field: 'dossierEmailFileName' })
    cy.clickButton('Complete dossier creation')
    cy.pageHeading().should('equal', `Dossier created and sent for ${firstLastName}`)
  })

  it('asks for current prison then NSY email confirmation, if the person has returned to custody', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        currentPrison: undefined,
      },
    })
    cy.task('expectUpdateRecall', { recallId, status })
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-recall' })
    cy.clickLink('Create dossier')
    cy.pageHeading().should('equal', `Which prison is ${personName} in?`)
    cy.selectFromAutocomplete(`Which prison is ${personName} in?`, 'Kenn')
    // reset the stub so it includes current prison, ready for the next page render
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
      },
    })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Email New Scotland Yard')
    cy.getLinkHref('Email New Scotland Yard', { parent: 'form' }).should(
      'contain',
      'mailto:test@domain.com?subject=RTC%20-%20Bobby%20Badger%20-%20A123456&body=Please%20note%20that%20Bobby%20Badger%20-%2028%20May%201999%2C%20CRO%20-%201234%2F56A%2C%20Booking%20number%20-%20A123456%20-%20was%20returned%20to%20Kennet%20(HMP)%20on%2022%20January%202022%20at%2013%3A45.%20Please%20remove%20them%20from%20the%20PNC%20if%20this%20has%20not%20already%20been%20done.'
    )
    cy.selectConfirmationCheckbox('I have sent the email')
    cy.uploadEmail({ field: 'nsyEmailFileName' })
    cy.clickButton('Continue')
    cy.getLinkHref('Back').should('contain', '/dossier-nsy-email')
    // NSY email visible on recall info page
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status,
        documents: [
          {
            category: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
            documentId: '639',
            fileName: 'nsy.msg',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-04-01T12:00:00.000Z',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('NSY email uploaded').should('contain', 'nsy.msg')
  })

  it('errors - email New Scotland Yard', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: emptyRecall,
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-nsy-email' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'confirmNsyEmailSent',
      summaryError: "Confirm you've sent the email to all recipients",
    })

    // confirm sending but don't enter a send date or upload an email
    cy.selectConfirmationCheckbox('I have sent the email')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'nsyEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('errors - user did not confirm check', () => {
    cy.task('expectGetRecall', {
      expectedResult: emptyRecall,
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-download' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'hasDossierBeenChecked',
      summaryError: "Confirm you've checked the information in the dossier and letter",
    })
  })

  it('error - download document fails', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, hasDossierBeenChecked: undefined },
    })
    stubRefData()
    cy.task('expectGetRecallDocumentHistory', { expectedResult: [] })
    cy.task('expectGenerateRecallDocument', { statusCode: 500 })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-download' })
    cy.downloadFile('Download the Dossier', { allowPageReload: true })
    cy.get(`[href="#error_DOSSIER"]`).should(
      'have.text',
      'An error occurred when creating the dossier. Please try downloading it again'
    )
    cy.downloadFile('Download the Letter to probation', { allowPageReload: true })
    cy.get(`[href="#error_LETTER_TO_PROBATION"]`).should(
      'have.text',
      'An error occurred when creating the letter to probation. Please try downloading it again'
    )
    cy.downloadFile('Download the Letter to prison', { allowPageReload: true })
    cy.get(`[href="#error_LETTER_TO_PRISON"]`).should(
      'have.text',
      'An error occurred when creating the letter to prison. Please try downloading it again'
    )
    cy.getElement('Continue').should('be.disabled')
  })

  it('errors - email the dossier', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: emptyRecall,
    })

    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-email' })
    cy.clickButton('Complete dossier creation')
    cy.assertErrorMessage({
      fieldName: 'confirmDossierEmailSent',
      summaryError: "Confirm you've sent the email to all recipients",
    })

    // confirm sending but don't enter a send date or upload an email
    cy.selectConfirmationCheckbox('I have sent the email to all recipients')
    cy.clickButton('Complete dossier creation')
    cy.assertErrorMessage({
      fieldId: 'dossierEmailSentDate-dossierEmailSentDateDay',
      fieldName: 'dossierEmailSentDate',
      summaryError: 'Enter the date you sent the email',
    })
    cy.assertErrorMessage({
      fieldName: 'dossierEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('previously saved dossier email', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            documentId: 'ea443809-4b29-445a-8c36-3ff259f48b03',
            category: 'DOSSIER_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-email' })
    cy.selectConfirmationCheckbox('I have sent the email to all recipients')
    cy.getText('uploadedDocument-DOSSIER_EMAIL').should('contain', 'email.msg')
  })

  it('letter page', () => {
    const nomisQuestion = `Is ${personName} being held under a different NOMIS number to the one on the licence?`
    // errors for missing fields
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.task('expectUpdateRecall', { recallId })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-letter' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'additionalLicenceConditions',
      summaryError: 'Are there additional licence conditions?',
    })
    cy.assertErrorMessage({
      fieldName: 'differentNomsNumber',
      summaryError: nomisQuestion,
    })

    // invalid NOMIS
    cy.selectRadio('Are there additional licence conditions?', 'No')
    cy.selectRadio(nomisQuestion, 'Yes')
    cy.fillInput(`NOMIS number ${personName} is being held under`, '123', {
      parent: '#conditional-differentNomsNumber',
    })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'differentNomsNumberDetail',
      summaryError: 'Enter a NOMIS number in the correct format',
    })

    // reset detail to empty string if user doesn't select Other reason, and there is existing detail for it
    cy.task('expectGetRecall', {
      expectedResult: {
        ...emptyRecall,
        additionalLicenceConditions: true,
        additionalLicenceConditionsDetail: 'one, two',
        differentNomsNumber: true,
        differentNomsNumberDetail: 'AC3408303',
      },
    })
    cy.reload()
    cy.selectRadio('Are there additional licence conditions?', 'No')
    cy.selectRadio(nomisQuestion, 'No')
    cy.clickButton('Continue')
    cy.assertRecallFieldsSavedToApi({
      recallId,
      bodyValues: {
        additionalLicenceConditions: false,
        additionalLicenceConditionsDetail: '',
        differentNomsNumber: false,
        differentNomsNumberDetail: '',
      },
    })
  })

  it('makes letter to probation available to download for a not in custody recall', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        bookingNumber: 'A123456',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        returnedToCustodyDateTime: '2022-01-22T13:45:33.000Z',
        returnedToCustodyNotificationDateTime: '2022-01-23T08:22:06.000Z',
        recallId,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'dossier-download' })
    cy.pageHeading().should('equal', 'Download the dossier and letters')
    cy.getLinkHref({
      qaAttr: 'getLetterToProbationLink',
    }).should('contain', `/recalls/${recallId}/documents/create?category=LETTER_TO_PROBATION`)
    cy.getText('getLetterToProbationFileName').should('equal', 'Filename: BADGER BOBBY A123456 LETTER TO PROBATION.pdf')
  })
})
