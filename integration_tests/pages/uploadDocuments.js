import { requiredDocsList } from '../../server/routes/handlers/helpers'

const page = require('./page')

const uploadDocumentsPage = ({ nomsNumber, recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/upload-documents` : null,
    upload: () => {
      requiredDocsList().forEach(doc => {
        cy.get(`[name="${doc.name}"]`).attachFile({
          filePath: '../test.pdf',
          mimeType: 'application/pdf',
        })
      })
    },
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
