import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

const uploadDocumentsPage = require('../pages/uploadDocuments')
const assessRecallPage = require('../pages/assessRecall')

context('Upload documeents', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'

  it('User can upload a document', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.login()

    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.upload()
    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: 'Bobby Badger' })
    const { category } = getRecallResponse.documents[0]
    assessRecall.expectUploadedDocument({ category, label: 'Download PDF' })
  })

  it('User sees an error if upload fails', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })
    cy.task('expectAddRecallDocument', { statusCode: 400 })
    cy.login()

    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.upload()
    uploadDocuments.expectUploadedDocumentError()
  })
})
