import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'

context('Generated document versions', () => {
  const recallId = '3456345664356'
  const documentId = '123'
  const recall = {
    ...getRecallResponse,
    recallId,
    status: RecallResponse.status.DOSSIER_ISSUED,
    documents: [
      {
        category: 'RECALL_NOTIFICATION',
        documentId,
        version: 2,
        createdDateTime: '2021-11-21T12:34:30.000Z',
        details: 'Sentencing info changed',
        fileName: 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
      },
      {
        category: 'REVOCATION_ORDER',
        documentId: '2123',
        version: 1,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
        fileName: 'BADGER BOBBY A123456 REVOCATION ORDER.pdf',
      },
      {
        category: 'LETTER_TO_PRISON',
        documentId: '3123',
        version: 5,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
        fileName: 'BADGER BOBBY A123456 LETTER TO PRISON.pdf',
      },
      {
        category: 'LETTER_TO_PROBATION',
        documentId: '3123',
        version: 5,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
        fileName: 'BADGER BOBBY A123456 LETTER TO PROBATION.pdf',
      },
      {
        category: 'DOSSIER',
        documentId: '4123',
        version: 4,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
        fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
      },
      {
        category: 'REASONS_FOR_RECALL',
        documentId: '5123',
        version: 3,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
        fileName: 'BADGER BOBBY A123456 REASONS FOR RECALL.pdf',
      },
    ],
  }

  beforeEach(() => {
    cy.login()
    cy.task('expectGenerateRecallDocument', { statusCode: 201 })
  })

  // NOTE - there's a test in assess-recall.spec.js for downloading the recall notification

  it("if a document hasn't been generated, it won't be listed on recall info", () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...recall,
        documents: [],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.getText('appGeneratedDocuments-RECALL_NOTIFICATION-not-available').should('contain', 'Not available')
    cy.getElement('appGeneratedDocuments-RECALL_NOTIFICATION-Change').should('not.exist')
  })

  it('all generated documents are listed and user can generate a new document version', () => {
    const recallId2 = '83472929'
    cy.task('expectGetRecall', { expectedResult: { ...recall, recallId: recallId2 } })
    const changeLinkHref = `/recalls/${recallId2}/generated-document-version?fromPage=view-recall&fromHash=generated-documents&versionedCategoryName=`
    cy.visitRecallPage({ recallId: recallId2, pageSuffix: 'view-recall' })
    // show link, version number, detail for a document with verion > 1
    cy.getText('appGeneratedDocuments-RECALL_NOTIFICATION').should(
      'contain',
      'IN CUSTODY RECALL BADGER BOBBY A123456.pdf'
    )
    cy.getText('appGeneratedDocuments-RECALL_NOTIFICATION-version').should('contain', 'version 2')
    cy.getText('appGeneratedDocuments-RECALL_NOTIFICATION-details').should('contain', 'Sentencing info changed')
    cy.getText('appGeneratedDocuments-REVOCATION_ORDER').should('contain', 'BADGER BOBBY A123456 REVOCATION ORDER.pdf')
    cy.getLinkHref({
      qaAttr: 'appGeneratedDocuments-REVOCATION_ORDER-Change',
    }).should('contain', `${changeLinkHref}REVOCATION_ORDER`)
    cy.getText('appGeneratedDocuments-LETTER_TO_PRISON').should('contain', 'BADGER BOBBY A123456 LETTER TO PRISON.pdf')
    cy.getLinkHref({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PRISON-Change',
    }).should('contain', `${changeLinkHref}LETTER_TO_PRISON`)
    cy.getText('appGeneratedDocuments-LETTER_TO_PROBATION').should(
      'contain',
      'BADGER BOBBY A123456 LETTER TO PROBATION.pdf'
    )
    cy.getLinkHref({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PROBATION-Change',
    }).should('contain', `${changeLinkHref}LETTER_TO_PROBATION`)
    cy.getText('appGeneratedDocuments-DOSSIER').should('contain', 'BADGER BOBBY A123456 RECALL DOSSIER.pdf')
    cy.getLinkHref({
      qaAttr: 'appGeneratedDocuments-DOSSIER-Change',
    }).should('contain', `${changeLinkHref}DOSSIER`)
    cy.getText('appGeneratedDocuments-REASONS_FOR_RECALL').should(
      'contain',
      'BADGER BOBBY A123456 REASONS FOR RECALL.pdf'
    )
    cy.getLinkHref({
      qaAttr: 'appGeneratedDocuments-REASONS_FOR_RECALL-Change',
    }).should('contain', `${changeLinkHref}REASONS_FOR_RECALL`)

    // create a new version of revocation order
    cy.clickLink('Change Revocation order')
    cy.pageHeading().should('contain', 'Create a new revocation order')
    cy.getText('previousVersionFileName').should('contain', 'BADGER BOBBY A123456 REVOCATION ORDER.pdf')
    cy.getLinkHref({
      qaAttr: 'previousVersionFileName',
    }).should('contain', `/recalls/${recallId2}/documents/2123`)
    cy.getText('previousVersionCreatedDateTime').should('contain', 'Created on 19 November 2021 at 14:14')
    cy.getText('textAdvisory').should(
      'contain',
      'We will also create new versions of the recall notification and dossier, as they both contain the revocation order.'
    )

    // error shown if details not entered
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'details',
      errorMessage: 'Provide more detail',
      summaryError: 'Provide more detail',
    })

    cy.fillInput('Provide more detail', 'Sentencing date corrected.')
    cy.clickButton('Continue')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId2}/documents/generated`,
      method: 'POST',
      bodyValues: {
        category: 'DOSSIER',
        details: 'Sentencing date corrected.',
      },
    })
    cy.pageHeading().should('contain', 'View the recall')
  })

  it("an error is shown if details aren't entered", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: recall,
    })
    cy.visitRecallPage({
      recallId,
      pageSuffix: 'generated-document-version?fromPage=view-recall&versionedCategoryName=RECALL_NOTIFICATION',
    })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'details',
      errorMessage: 'Provide more detail',
      summaryError: 'Provide more detail',
    })
  })

  it("recall notification filename reflects custody status, if it hasn't been created before", () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        bookingNumber: '12345C',
        status: RecallResponse.status.IN_ASSESSMENT,
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        documents: [],
      },
    })
    const fileName = 'NOT IN CUSTODY RECALL BADGER BOBBY 12345C.pdf'
    cy.visitRecallPage({ recallId, pageSuffix: 'assess-download' })
    cy.getText('getRecallNotificationFileName').should('equal', `Filename: ${fileName}`)
  })

  it('recall notification uses existing filename if one has been created', () => {
    const docId = '999'
    const fileName = 'IN CUSTODY RECALL BADGER BOBBY 12345C.pdf'
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        bookingNumber: '12345C',
        status: RecallResponse.status.IN_ASSESSMENT,
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        documents: [
          {
            category: RecallDocument.category.RECALL_NOTIFICATION,
            fileName,
            documentId: docId,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'assess-download' })
    cy.getText('getRecallNotificationFileName').should('equal', `Filename: ${fileName}`)
  })
})
