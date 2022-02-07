import { getRecallResponse } from '../mockApis/mockResponses'
import newGeneratedDocumentVersionPage from '../pages/newGeneratedDocumentVersion'

const recallInformationPage = require('../pages/recallInformation')

context('Generated document versions', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const documentId = '123'
  const recall = {
    ...getRecallResponse,
    recallId,
    status: 'DOSSIER_ISSUED',
    documents: [
      {
        category: 'RECALL_NOTIFICATION',
        documentId,
        version: 2,
        createdDateTime: '2021-11-21T12:34:30.000Z',
        details: 'Sentencing info changed',
      },
      {
        category: 'REVOCATION_ORDER',
        documentId: '2123',
        version: 1,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
      },
      {
        category: 'LETTER_TO_PRISON',
        documentId: '3123',
        version: 5,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
      },
      {
        category: 'DOSSIER',
        documentId: '4123',
        version: 4,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
      },
      {
        category: 'REASONS_FOR_RECALL',
        documentId: '5123',
        version: 3,
        createdDateTime: '2021-11-19T14:14:30.000Z',
        details: 'Details / info changed',
      },
    ],
  }

  beforeEach(() => {
    cy.login()
    cy.task('expectGenerateRecallDocument', { statusCode: 201 })
  })

  it("if a document hasn't been generated, it won't be listed on recall info", () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...recall,
        documents: [],
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallInformation.assertElementHasText({
      qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-not-available',
      textToFind: 'Not available',
    })
    recallInformation.assertElementNotPresent({ qaAttr: 'appGeneratedDocuments-RECALL_NOTIFICATION-Change' })
  })

  it('all generated documents are listed and user can generate a new document version', () => {
    const recallId2 = '83472929'
    cy.task('expectGetRecall', { expectedResult: { ...recall, recallId: recallId2 } })
    const changeLinkHref = `/persons/A1234AA/recalls/${recallId2}/generated-document-version?fromPage=view-recall&fromHash=generated-documents&versionedCategoryName=`
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId: recallId2, personName })
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
      href: `/persons/A1234AA/recalls/${recallId2}/documents/2123`,
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
    newGeneratedDocumentVersion.clickContinue()
    newGeneratedDocumentVersion.assertErrorMessage({
      fieldName: 'details',
      errorMessage: 'Provide more detail',
      summaryError: 'Provide more detail',
    })

    newGeneratedDocumentVersion.enterTextInInput({ name: 'details', text: 'Sentencing date corrected.' })
    newGeneratedDocumentVersion.clickContinue()
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
    newGeneratedDocumentVersion.clickContinue()
    newGeneratedDocumentVersion.assertErrorMessage({
      fieldName: 'details',
      errorMessage: 'Provide more detail',
      summaryError: 'Provide more detail',
    })
  })
})
