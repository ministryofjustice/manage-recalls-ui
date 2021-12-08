import { requiredDocsList } from '../../server/routes/handlers/documents/upload/helpers'

const page = require('./page')

const uploadDocumentsPage = ({ nomsNumber, recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/upload-documents` : null,
    upload: file => {
      requiredDocsList().forEach(() => {
        cy.get(`[name="documents"]`).attachFile(file)
      })
    },
    uploadSingleFile: file => {
      cy.get(`[name="documents"]`).attachFile(file)
    },
    assertDocumentUploadError: ({ documentId, summaryError }) => {
      cy.get(`[href="#${documentId}"]`).should('have.text', summaryError)
    },
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
