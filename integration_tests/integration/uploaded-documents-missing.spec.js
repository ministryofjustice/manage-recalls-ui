import { getEmptyRecallResponse, getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import recallMissingDocumentsPage from '../pages/recallMissingDocuments'
import recallInformationPage from '../pages/recallInformation'

context('Missing uploaded documents', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const documentId = '123'
  const personName = 'Bobby Badger'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [],
      },
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.login()
  })

  it('missing documents are listed on the view recall page', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId: '123',
            version: 2,
          },
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: '789',
            version: 1,
          },
        ],
      },
    })
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })
    // missing documents
    recallInformation.assertElementHasText({
      qaAttr: 'required-LICENCE',
      textToFind: 'Missing: needed to create dossier',
    })
    recallInformation.assertElementHasText({ qaAttr: 'missing-OASYS_RISK_ASSESSMENT', textToFind: 'Missing' })
  })

  it('user can go back to add documents from the check your answers page to see a list of missing documents', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.BEING_BOOKED_ON,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
          },
        ],
      },
    })
    cy.task('expectDeleteRecallDocument')
    cy.task('expectSetDocumentCategory')
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId })
    checkAnswers.clickLink({ label: 'Add documents' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.assertListValues({
      qaAttrList: 'missingDocsList',
      valuesToCompare: ['Licence', 'Previous convictions sheet', 'OASys Risk Assessment'],
    })
  })

  it('user can view details of a previous missing documents entry', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        documents: [
          {
            category: 'MISSING_DOCUMENTS_EMAIL',
          },
        ],
        missingDocumentsRecords: [
          {
            categories: ['OASYS_RISK_ASSESSMENT', 'PART_A_RECALL_REPORT'],
            createdByUserId: '888',
            createdDateTime: '2021-11-10T05:34:25.000Z',
            detail: 'Chased up, see attached',
            emailId: '987',
            missingDocumentsRecordId: '1',
            version: 2,
          },
        ],
      },
    })
    const recallMissingDocuments = recallMissingDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    recallMissingDocuments.assertInputValue({
      fieldName: 'missingDocumentsDetail',
      value: 'Chased up, see attached',
    })
  })

  it("an error is shown if the missing documents email and detail aren't submitted", () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    const recallMissingDocuments = recallMissingDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    recallMissingDocuments.clickContinue()
    recallMissingDocuments.assertErrorMessage({
      fieldName: 'missingDocumentsEmailFileName',
      summaryError: 'Select an email',
    })
    recallMissingDocuments.assertErrorMessage({
      fieldName: 'missingDocumentsDetail',
      summaryError: 'Provide more detail',
    })
  })
})
