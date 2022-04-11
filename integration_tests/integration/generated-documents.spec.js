import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import newGeneratedDocumentVersionPage from '../pages/newGeneratedDocumentVersion'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'

const recallInformationPage = require('../pages/recallInformation')

context('Generated document versions', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '3456345664356'
  const personName = 'Bobby Badger'
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
    const recallInformation = recallInformationPage.verifyOnPage({ recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-not-available',
      textToFind: 'Not available',
    })
    recallInformation.assertElementNotPresent({ qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-Change' })
  })

  it('all generated documents are listed and user can generate a new document version', () => {
    const recallId2 = '83472929'
    cy.task('expectGetRecall', { expectedResult: { ...recall, recallId: recallId2 } })
    const changeLinkHref = `/recalls/${recallId2}/generated-document-version?fromPage=view-recall&fromHash=generated-documents&versionedCategoryName=`
    const recallInformation = recallInformationPage.verifyOnPage({ recallId: recallId2, personName })
    // show link, version number, detail for a document with verion > 1
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION',
      textToFind: 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-version',
      textToFind: 'version 2',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-details',
      textToFind: 'Sentencing info changed',
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-REVOCATION_ORDER',
      textToFind: 'BADGER BOBBY A123456 REVOCATION ORDER.pdf',
    })
    recallInformation.assertLinkHref({
      qaAttr: 'appGeneratedDocuments-REVOCATION_ORDER-Change',
      href: `${changeLinkHref}REVOCATION_ORDER`,
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PRISON',
      textToFind: 'BADGER BOBBY A123456 LETTER TO PRISON.pdf',
    })
    recallInformation.assertLinkHref({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PRISON-Change',
      href: `${changeLinkHref}LETTER_TO_PRISON`,
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PROBATION',
      textToFind: 'BADGER BOBBY A123456 LETTER TO PROBATION.pdf',
    })
    recallInformation.assertLinkHref({
      qaAttr: 'appGeneratedDocuments-LETTER_TO_PROBATION-Change',
      href: `${changeLinkHref}LETTER_TO_PROBATION`,
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-DOSSIER',
      textToFind: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
    })
    recallInformation.assertLinkHref({
      qaAttr: 'appGeneratedDocuments-DOSSIER-Change',
      href: `${changeLinkHref}DOSSIER`,
    })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-REASONS_FOR_RECALL',
      textToFind: 'BADGER BOBBY A123456 REASONS FOR RECALL.pdf',
    })
    recallInformation.assertLinkHref({
      qaAttr: 'appGeneratedDocuments-REASONS_FOR_RECALL-Change',
      href: `${changeLinkHref}REASONS_FOR_RECALL`,
    })

    // create a new version of revocation order
    recallInformation.clickElement({ qaAttr: 'appGeneratedDocuments-REVOCATION_ORDER-Change' })
    const newGeneratedDocumentVersion = newGeneratedDocumentVersionPage.verifyOnPage({
      documentCategoryLabel: 'revocation order',
    })
    newGeneratedDocumentVersion.assertElementHasText({
      qaAttr: 'previousVersionFileName',
      textToFind: 'BADGER BOBBY A123456 REVOCATION ORDER.pdf',
    })
    newGeneratedDocumentVersion.assertLinkHref({
      qaAttr: 'previousVersionFileName',
      href: `/recalls/${recallId2}/documents/2123`,
    })
    newGeneratedDocumentVersion.assertElementHasText({
      qaAttr: 'previousVersionCreatedDateTime',
      textToFind: 'Created on 19 November 2021 at 14:14',
    })
    newGeneratedDocumentVersion.assertElementHasText({
      qaAttr: 'textAdvisory',
      textToFind:
        'We will also create new versions of the recall notification and dossier, as they both contain the revocation order.',
    })

    // error shown if details not entered
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'details',
      errorMessage: 'Provide more detail',
      summaryError: 'Provide more detail',
    })

    newGeneratedDocumentVersion.enterTextInInput({ name: 'details', text: 'Sentencing date corrected.' })
    cy.clickButton('Continue')
    newGeneratedDocumentVersion.assertApiRequestBody({
      url: `/recalls/${recallId2}/documents/generated`,
      method: 'POST',
      bodyValues: {
        category: 'DOSSIER',
        details: 'Sentencing date corrected.',
      },
    })
    recallInformationPage.verifyOnPage({ personName })
  })

  it("an error is shown if details aren't entered", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: recall,
    })
    const newGeneratedDocumentVersion = newGeneratedDocumentVersionPage.verifyOnPage({
      recallId,
      nomsNumber,
      documentCategoryName: 'RECALL_NOTIFICATION',
      documentCategoryLabel: 'recall notification',
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
