const page = require('./page')
const validateBinaryFile = require('../integration/file-utils')

const assessRecallDownloadPage = ({ nomsNumber, recallId } = {}) =>
  page('Download recall notification', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/assess-download` : null,
    confirmEmailSent: () => cy.get('[value="YES"]').click(),
    downloadRecallNotification: () => {
      cy.readFile('integration_tests/test.pdf', 'base64').then(base64EncodedPdf => {
        cy.task('expectGetRevocationOrder', { recallId, expectedPdfFile: base64EncodedPdf })
        cy.get('[data-qa=getRevocationOrderButton]').click()
        validateBinaryFile('revocation-order.pdf', 3908)
      })
    },
  })

module.exports = { verifyOnPage: assessRecallDownloadPage }
