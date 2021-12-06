const userDetailsPage = require('../pages/userDetails')

context('User details', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
    cy.task('expectAddUserDetails')
    cy.login()
  })

  it('user adds their details', () => {
    cy.task('expectGetCurrentUserDetails', {
      status: 404,
    })
    cy.task('expectAddUserDetails')
    const userDetails = userDetailsPage.verifyOnPage({ detailsAdded: false })
    userDetails.enterTextInInput({ name: 'firstName', text: 'Barry' })
    userDetails.enterTextInInput({ name: 'lastName', text: 'Badger' })
    userDetails.enterTextInInput({ name: 'email', text: 'barry@badger.com' })
    userDetails.enterTextInInput({ name: 'phoneNumber', text: '0739378378' })
    userDetails.checkRadio({ fieldName: 'caseworkerBand', value: 'FOUR_PLUS' })
    userDetails.uploadFile({ fieldName: 'signature', fileName: 'signature.jpg', mimeType: 'image/jpeg' })
    userDetails.clickButton({ qaAttr: 'updateButton' })
    userDetails.assertApiRequestBody({
      url: '/users',
      method: 'POST',
      bodyValues: {
        firstName: 'Barry',
        lastName: 'Badger',
        email: 'barry@badger.com',
        phoneNumber: '0739378378',
        caseworkerBand: 'FOUR_PLUS',
      },
    })
  })

  it('user views their details', () => {
    cy.task('expectGetCurrentUserDetails', {
      status: 200,
      expectedResult: {
        firstName: 'Barry',
        lastName: 'Badger',
        email: 'barry@badger.com',
        phoneNumber: '0739378378',
        caseworkerBand: 'FOUR_PLUS',
        signature: 'def',
        userId: '123',
      },
    })
    const userDetails = userDetailsPage.verifyOnPage({ detailsAdded: true })
    userDetails.assertInputValue({ fieldName: 'firstName', value: 'Barry' })
    userDetails.assertInputValue({ fieldName: 'lastName', value: 'Badger' })
    userDetails.assertInputValue({ fieldName: 'email', value: 'barry@badger.com' })
    userDetails.assertInputValue({ fieldName: 'phoneNumber', value: '0739378378' })
    userDetails.assertRadioChecked({ fieldName: 'caseworkerBand', value: 'FOUR_PLUS' })
    userDetails.assertElementPresent({ qaAttr: 'signature-image' })
  })
})
