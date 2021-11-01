import { requiredDocsList } from '../../server/routes/handlers/helpers/documents'

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
    setDocumentCategory: ({ documentId, category }) => cy.get(`[id="category-${documentId}"]`).select(category),
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
