context('User details', () => {
  beforeEach(() => {
    cy.login()
  })

  it('user adds their details', () => {
    cy.task('expectGetCurrentUserDetails', {
      status: 404,
    })
    cy.task('expectAddUserDetails')
    cy.visit('/user-details')
    cy.fillInput('First name', 'Barry')
    cy.fillInput('Last name', 'Badger')
    cy.fillInput('Email address', 'barry@badger.com', { clearExistingText: true })
    cy.fillInput('Phone number', '07393783789', { clearExistingText: true })
    cy.selectRadio('Caseworker band', 'Band 4+')
    cy.uploadImage({ field: 'signature', file: 'signature.jpg' })
    cy.clickButton('Save')
    cy.assertSaveToRecallsApi({
      url: '/users',
      method: 'POST',
      bodyValues: {
        firstName: 'Barry',
        lastName: 'Badger',
        email: 'barry@badger.com',
        phoneNumber: '07393783789',
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
    cy.visit('/user-details')
    cy.getTextInputValue('First name').should('contain', 'Barry')
    cy.getTextInputValue('Last name').should('contain', 'Badger')
    cy.getTextInputValue('Email address').should('contain', 'barry@badger.com')
    cy.getTextInputValue('Phone number').should('contain', '0739378378')
    cy.getRadioOptionByLabel('Caseworker band', 'Band 4+').should('be.checked')
    cy.getElement({ qaAttr: 'signature-image' }).should('exist')
  })

  it('user clicks on their name in the header to go to user details page', () => {
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
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
    cy.visit('/')
    cy.clickLink({ qaAttr: 'header-user-name' })
    cy.pageHeading().should('contain', 'User details')
  })
})
