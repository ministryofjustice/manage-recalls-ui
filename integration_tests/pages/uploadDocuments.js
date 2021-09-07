const page = require('./page')

const uploadDocumentsPage = ({ nomsNumber, recallId } = {}) =>
  page('Upload documents', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/upload-documents` : null,
    upload: () => {
      cy.get('[name="PART_A_RECALL_REPORT"]').attachFile({
        filePath: '../test.pdf',
        mimeType: 'application/pdf',
      })
      cy.get('[data-qa="continueButton"]').click()
    },
    expectUploadedDocumentError: errorMsg => {
      cy.get(`[data-qa=error-list] li:first-child`).should($searchResults => {
        const text = $searchResults.text()
        expect(text.trim()).to.equal(errorMsg)
      })
    },
  })

module.exports = { verifyOnPage: uploadDocumentsPage }
