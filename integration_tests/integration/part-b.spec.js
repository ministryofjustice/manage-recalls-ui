import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'
import { formatDateTimeFromIsoString } from '../../server/controllers/utils/dates/format'
import { booleanToYesNo } from '../support/utils'

context('Part B', () => {
  beforeEach(() => {
    cy.login()
  })

  it('lets the user upload a part B', () => {
    const recalls = [
      {
        ...getEmptyRecallResponse,
        confirmedRecallType: 'STANDARD',
        status: 'AWAITING_PART_B',
      },
    ]
    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.task('expectAddPartBRecord')
    cy.task('expectUpdateRecall', { recallId: '123' })
    const partBRecord = getRecallResponse.partBRecords[0]
    cy.visit('/')
    cy.clickLink('Awaiting part B (1)')
    cy.clickLink('Upload part B')

    cy.pageHeading().should('equal', 'Upload documents')
    cy.uploadPDF({ field: 'partBFileName', file: 'test.pdf' })
    cy.uploadPDF({ field: 'oasysFileName', file: 'test.pdf' })
    cy.fillInput('Provide more detail', partBRecord.details)
    cy.enterDateTime(partBRecord.partBReceivedDate)
    cy.uploadEmail({ field: 'emailFileName' })
    cy.clickButton('Continue')

    cy.selectRadio('Do probation support re-release?', booleanToYesNo(getRecallResponse.rereleaseSupported))

    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        documents: [
          {
            category: RecallDocument.category.PART_B_RISK_REPORT,
            documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            version: 2,
            createdDateTime: '2020-04-01T12:00:00.000Z',
            createdByUserName: 'Arnold Caseworker',
            fileName: 'Bobby Badger part B.pdf',
          },
        ],
      },
    })
    cy.clickButton('Continue')
    const { firstName, lastName } = getRecallResponse
    cy.pageHeading().should('equal', `View the recall for ${firstName} ${lastName}`)

    // confirmation banner
    cy.getText('confirmationHeading').should('equal', 'Part B added')
    cy.getText('confirmationBody').should('contain', 'Part B report and OASys uploaded.')
    cy.getText('confirmationBody').should('contain', 'Part B email and note added.')
    cy.getText('confirmationBody').should(
      'contain',
      'Re-release recommendation added' //  and recall moved to Dossier team list'
    )

    // part B details
    cy.recallInfo('Part B email received').should(
      'equal',
      formatDateTimeFromIsoString({ isoDate: partBRecord.partBReceivedDate })
    )
    cy.recallInfo('Part B report').should('contain', 'Part B.pdf')
    cy.recallInfo('Part B details').should('equal', partBRecord.details)
    cy.recallInfo('Part B uploaded by').should('equal', partBRecord.createdByUserName)
    cy.recallInfo('Part B email uploaded').should('equal', partBRecord.emailFileName)
    cy.recallInfo('Re-release supported by probation').should(
      'contain',
      booleanToYesNo(getRecallResponse.rereleaseSupported)
    )
    // change links
    cy.getLinkHref('Change part B email received date').should('contain', '/part-b')
    cy.getLinkHref('Change part B details').should('contain', '/part-b')
    cy.getLinkHref('Change part B email').should('contain', '/part-b')
    cy.getLinkHref('Change part B report').should('contain', '/part-b')
  })

  it('errors - upload a part B', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse },
    })
    cy.visitRecallPage({ recallId: '123', pageSuffix: 'part-b' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'partBFileName',
      summaryError: 'Select a part B',
    })
    cy.assertErrorMessage({
      fieldName: 'details',
      summaryError: 'Provide more detail',
    })
    cy.assertErrorMessage({
      fieldId: 'partBReceivedDate-partBReceivedDateDay',
      fieldName: 'partBReceivedDate',
      summaryError: 'Enter the date you received the part B',
    })
    cy.assertErrorMessage({
      fieldName: 'emailFileName',
      summaryError: 'Select a part B email from probation',
    })
  })

  it('show part B is missing on recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, status: 'AWAITING_PART_B', partBDueDate: '2022-03-02', partBRecords: [] },
    })
    cy.task('expectAddMissingDocumentsRecord')
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.visitRecallPage({ recallId: '123', pageSuffix: 'view-recall' })
    cy.getText('partBDueText').should('contain', 'Overdue: Part B report was due on 2 March 2022')
    cy.getLinkHref('Add part B report').should('contain', '/part-b')

    // add missing document note
    cy.clickLink('Add note to this section')
    cy.uploadEmail({ field: 'missingDocumentsEmailFileName' })
    cy.fillInput('Provide more detail', 'Chased up part B', { clearExistingText: true })
    cy.clickButton('Continue')

    cy.getText('confirmation').should('equal', 'Chase note added.')
    cy.clickLink('View')
  })
})
