import { documentCategories } from '../../server/controllers/documents/documentCategories'

const page = require('./page')

// FIXME: copied from 'server/controllers/changeHistory/recallFieldList.ts' - rework so we can re-use that code without including restClient
const requiredDocsList = () => documentCategories.filter(doc => doc.type === 'document' && doc.required)

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
