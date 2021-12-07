const userDetailsPage = require('../pages/userDetails')
const recallsListPage = require('../pages/recallsList')

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
    const userDetails = userDetailsPage.verifyOnPage()
    userDetails.enterTextInInput({ name: 'firstName', text: 'Barry' })
    userDetails.enterTextInInput({ name: 'lastName', text: 'Badger' })
    userDetails.enterTextInInput({ name: 'email', text: 'barry@badger.com' })
    userDetails.enterTextInInput({ name: 'phoneNumber', text: '0739378378' })
    userDetails.checkRadio({ fieldName: 'caseworkerBand', value: 'FOUR_PLUS' })
    userDetails.uploadFile({ fieldName: 'signature', fileName: 'signature.jpg', mimeType: 'image/jpeg' })
    userDetails.clickButton({ qaAttr: 'saveButton' })
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
    const userDetails = userDetailsPage.verifyOnPage()
    userDetails.assertInputValue({ fieldName: 'firstName', value: 'Barry' })
    userDetails.assertInputValue({ fieldName: 'lastName', value: 'Badger' })
    userDetails.assertInputValue({ fieldName: 'email', value: 'barry@badger.com' })
    userDetails.assertInputValue({ fieldName: 'phoneNumber', value: '0739378378' })
    userDetails.assertRadioChecked({ fieldName: 'caseworkerBand', value: 'FOUR_PLUS' })
    userDetails.assertElementPresent({ qaAttr: 'signature-image' })
  })

  it('user clicks on their name in the header to go to user details page', () => {
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
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.clickLink({ qaAttr: 'header-user-name' })
    userDetailsPage.verifyOnPage()
  })
})
