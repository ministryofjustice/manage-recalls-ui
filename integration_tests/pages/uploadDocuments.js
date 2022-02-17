import { requiredDocsList } from '../../server/controllers/documents/upload/helpers'

const page = require('./page')

const uploadDocumentsPage = ({ nomsNumber, recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/upload-documents` : null,
    uploadAllRequiredDocs: file => {
      requiredDocsList().forEach(() => {
        cy.get(`[name="documents"]`).attachFile(file)
      })
    },
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
