import { requiredDocsList } from '../../server/routes/handlers/helpers/documents'

const page = require('./page')

const uploadDocumentsPage = ({ nomsNumber, recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/upload-documents` : null,
    upload: () => {
      requiredDocsList().forEach(() => {
        cy.get(`[name="documents"]`).attachFile({
          filePath: '../test.pdf',
          mimeType: 'application/pdf',
        })
      })
    },
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
