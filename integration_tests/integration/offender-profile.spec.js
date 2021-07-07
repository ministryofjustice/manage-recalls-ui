import validateBinaryFile from './file-utils'

const offenderProfilePage = require('../pages/offenderProfile')

context('Offender profile', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = '123ABC'
  it('User can generate revocation order', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    expectSearchResultsFromManageRecallsApi(nomsNumber, [
      {
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1999-05-28',
      },
    ])

    cy.readFile('integration_tests/expected-revocation-order.pdf', 'base64').then(base64EncodedPdf => {
      expectRevocationOrderFromManageRecallsApi({ content: base64EncodedPdf })
      cy.login()

      const offenderProfile = offenderProfilePage.verifyOnPage(nomsNumber)
      offenderProfile.generateRevocationOrder()

      validateBinaryFile('revocation-order.pdf', 67658)

      cy.task('readPdf', './cypress/downloads/revocation-order.pdf').then(({ numpages, text }) => {
        expect(numpages, 'number of PDF pages').to.equal(1)
        expect(text, 'has expected text').to.include('REVOCATION OF LICENCE')
      })
    })
  })

  it('User can create a recall', () => {
    const recallId = '123'
    cy.task('expectListRecalls', { expectedResults: [] })
    expectSearchResultsFromManageRecallsApi(nomsNumber, [
      {
        firstName: 'Bobby',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1999-05-28',
      },
    ])

    expectCreateRecallFromManageRecallsApi({ recallId })
    cy.login()

    const offenderProfile = offenderProfilePage.verifyOnPage(nomsNumber)
    offenderProfile.createRecall()
    offenderProfile.expectRecallIdConfirmation(`Recall ID: ${recallId}`)
  })

  function expectCreateRecallFromManageRecallsApi(expectedResults) {
    cy.task('expectCreateRecall', { expectedResults })
  }

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }

  function expectRevocationOrderFromManageRecallsApi(expectedPdfFile) {
    cy.task('expectGenerateRevocationOrder', expectedPdfFile)
  }
})
