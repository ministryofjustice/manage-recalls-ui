import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'
import { formatDateTimeFromIsoString } from '../../server/controllers/utils/dates/format'

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
    const { firstName, lastName } = getRecallResponse
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', `View the recall for ${firstName} ${lastName}`)

    // confirmation banner
    cy.getText('confirmationHeading').should('equal', 'Part B added')
    cy.getText('confirmationBody').should('contain', 'Part B report and OASys uploaded.')
    cy.getText('confirmationBody').should('contain', 'Part B email and note added.')
    cy.getText('confirmationBody').should(
      'contain',
      'Re-release recommendation added and recall moved to Dossier team list'
    )

    // part B details
    cy.recallInfo('Part B email received').should('equal', formatDateTimeFromIsoString(partBRecord.partBReceivedDate))
    cy.recallInfo('Part B report').should('contain', 'Part B.pdf')
    cy.recallInfo('Part B details').should('equal', partBRecord.details)
    cy.recallInfo('Part B uploaded by').should('equal', partBRecord.createdByUserName)
    cy.recallInfo('Part B email uploaded').should('equal', partBRecord.emailFileName)
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
})
