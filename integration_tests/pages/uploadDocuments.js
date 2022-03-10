import { requiredDocsList } from '../../server/controllers/documents/upload/helpers'

const page = require('./page')

const uploadDocumentsPage = ({ recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/recalls/${recallId}/upload-documents` : null,
    uploadAllRequiredDocs: file => {
      requiredDocsList().forEach(() => {
        cy.get(`[name="documents"]`).attachFile(file)
      })
    },
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
