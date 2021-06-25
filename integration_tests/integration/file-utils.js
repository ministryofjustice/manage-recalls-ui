const path = require('path')

/**
 * Checks if the downloaded folder has file with the given name
 * and the given size in bytes.
 * @param {string} filename The downloaded file name
 * @param {number} expectedSize Expected binary file size in bytes
 */
export default function validateBinaryFile(filename, expectedSize) {
  expect(filename, 'filename').to.be.a('string')
  expect(expectedSize, 'file size').to.be.a('number').and.be.gt(0)

  const downloadsFolder = Cypress.config('downloadsFolder')
  const downloadedFilename = path.join(downloadsFolder, filename)

  cy.readFile(downloadedFilename, 'binary', { timeout: 3000 }).should(buffer => {
    if (buffer.length !== expectedSize) {
      throw new Error(`File size ${buffer.length} is not ${expectedSize}`)
    }
  })
}
