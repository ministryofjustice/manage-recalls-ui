import {
  getEmptyRecallResponse,
  getRecallResponse,
  getOsPlacesAddresses,
  getOsPlacesAddress,
} from '../mockApis/mockResponses'
import { formatIsoDate, getReferenceDataItemLabel } from '../support/utils'

context('Book a "not in custody" recall', () => {
  const recallId = '86954'
  const personName = `${getRecallResponse.firstName} ${getRecallResponse.lastName}`
  const status = 'BEING_BOOKED_ON'
  const newRecall = { ...getEmptyRecallResponse, recallId, status }

  beforeEach(() => {
    cy.login()
    cy.task('expectUpdateRecall', { recallId })
  })

  it('user can complete booking of a not in custody recall', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.task('expectAddLastKnownAddress')
    cy.task('osPlacesPostcodeLookup', { expectedResult: getOsPlacesAddresses })
    cy.task('osPlacesUprnLookup', { expectedResult: getOsPlacesAddress })
    cy.visitRecallPage({ recallId, pageSuffix: 'custody-status' })
    cy.selectRadio('Is Bobby Badger in custody?', 'No')
    cy.clickButton('Continue')
    cy.selectRadio(`Does ${personName} have a last known address?`, 'Yes')
    cy.clickButton('Continue')
    // ============================ postcode lookup ============================
    cy.pageHeading().should('equal', `Find an address`)
    // check error
    cy.clickButton('Find')
    cy.assertErrorMessage({ fieldName: 'postcode', summaryError: 'Enter a postcode' })
    // valid input
    cy.fillInput('Postcode', 'PE14 7DF')
    cy.clickButton('Find')
    // ============================ select an address ============================
    // check error
    cy.clickButton('Continue')
    cy.assertErrorMessage({ fieldName: 'addressUprn', summaryError: 'Select an address' })
    // valid input
    cy.selectFromDropdown('16 addresses', 'THE OAKS, LYNN ROAD, WALTON HIGHWAY, WISBECH, PE14 7DF')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Address added')
    cy.selectRadio('Do you want to add another address?', 'Yes')
    cy.clickButton('Continue')
    cy.clickLink("I can't find the postcode")
    // ============================ manual address entry ============================
    cy.pageHeading().should('equal', 'Add an address')
    // check errors
    cy.fillInput('Postcode', 'ZZZ 333')
    cy.clickButton('Continue')
    cy.assertErrorMessage({ fieldName: 'line1', summaryError: 'Enter an address line 1' })
    cy.assertErrorMessage({ fieldName: 'town', summaryError: 'Enter a town or city' })
    cy.assertErrorMessage({
      fieldName: 'postcode',
      summaryError: 'Enter a postcode in the correct format, like SW1H 9AJ',
    })
    // valid inputs
    cy.fillInput('Address line 1', '345 Porchester Road')
    cy.fillInput('Address line 2', 'Southsea')
    cy.fillInput('Town or city', 'Portsmouth')
    cy.fillInput('Postcode', 'PO1 4OY', { clearExistingText: true })
    cy.clickButton('Continue')

    cy.pageHeading().should('equal', 'Address added')
    cy.selectRadio('Do you want to add another address?', 'No')
    cy.clickButton('Continue')

    // recall type - fixed or standard
    cy.pageHeading().should('equal', 'What type of recall is being recommended?')
  })

  it('no fixed abode', () => {
    cy.task('expectGetRecall', { expectedResult: getRecallResponse })
    cy.visitRecallPage({ recallId, pageSuffix: 'last-known-address' })
    cy.selectRadio(`Does ${personName} have a last known address?`, 'No')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'What type of recall is being recommended?')
  })

  it('shows if person has last known addresses, arrest issues and not in custody status on the recall info page, after booking', () => {
    const lastKnownAddresses = [
      {
        line1: '345 Porchester Road',
        line2: 'Southsea',
        town: 'Portsmouth',
        postcode: 'PO1 4OY',
        index: 2,
        lastKnownAddressId: '345',
      },
      {
        line1: 'The Oaks, Amblin Road',
        line2: '',
        town: 'Birmingham',
        postcode: 'B3 5HU',
        index: 1,
        lastKnownAddressId: '678',
      },
    ]
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        inCustodyAtBooking: false,
        lastKnownAddressOption: 'YES',
        lastKnownAddresses,
        status: 'BOOKED_ON',
        returnedToCustodyDateTime: undefined,
        returnedToCustodyNotificationDateTime: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    const addressId = lastKnownAddresses[1].lastKnownAddressId
    let opts = { parent: `[data-qa="address-${addressId}"]` }
    cy.recallInfo('Address 1').should('contain', 'The Oaks, Amblin Road')
    cy.getText('line1', opts).should('equal', 'The Oaks, Amblin Road')
    cy.getText('town', opts).should('equal', 'Birmingham')
    cy.getText('postcode', opts).should('equal', 'B3 5HU')
    const addressId2 = lastKnownAddresses[0].lastKnownAddressId
    opts = { parent: `[data-qa="address-${addressId2}"]` }
    cy.recallInfo('Address 2').should('contain', '345 Porchester Road')
    cy.getText('line1', opts).should('equal', '345 Porchester Road')
    cy.getText('line2', opts).should('equal', 'Southsea')
    cy.getText('town', opts).should('equal', 'Portsmouth')
    cy.getText('postcode', opts).should('equal', 'PO1 4OY')

    cy.recallInfo('Arrest issues').should('equal', 'Detail...')
    cy.getLinkHref('Change arrest issues').should('contain', `/recalls/${recallId}/issues-needs`)
    cy.getText('inCustodyAtBooking').should('equal', 'Not in custody')
    cy.getElement('Change custody status at booking').should('not.exist')
  })

  it('shows if person has no fixed abode on the recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...newRecall,
        status: 'BOOKED_ON',
        inCustodyAtBooking: false,
        lastKnownAddressOption: 'NO_FIXED_ABODE',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Address').should('equal', 'No fixed abode')
    cy.getElement({ qaAttr: 'lastKnownAddressOptionChange' }).should(
      'have.attr',
      'href',
      `/recalls/${recallId}/last-known-address?fromPage=view-recall&fromHash=personalDetails`
    )
  })

  it('shows if person has no last known addresses provided on the assess recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...newRecall,
        status: 'BOOKED_ON',
        inCustodyAtBooking: false,
        lastKnownAddressOption: 'YES',
        lastKnownAddresses: [],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Address').should('equal', 'Not provided')
    cy.getLinkHref('Change or add addresses').should(
      'contain',
      `/recalls/${recallId}/address-list?fromPage=view-recall&fromHash=personalDetails`
    )
  })

  it('lets the user enter a warrant reference if assessment is complete', () => {
    const recalls = [
      {
        ...getRecallResponse,
        status: 'AWAITING_RETURN_TO_CUSTODY',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
        warrantReferenceNumber: '02RC/1234567C12345',
      },
      {
        ...getRecallResponse,
        firstName: 'Ben',
        lastName: 'Adams',
        status: 'ASSESSED_NOT_IN_CUSTODY',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        assignee: '122',
        assigneeUserName: 'Jimmy Pud',
        warrantReferenceNumber: undefined,
      },
    ]
    const warrantReferenceNumber = '04RC/6457367A74325'
    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.task('expectUnassignAssessment')
    cy.visit('/')
    cy.clickLink('Not in custody (2)')
    cy.clickLink('Add warrant reference')
    cy.fillInput('What is the warrant reference number?', warrantReferenceNumber)
    cy.task('expectGetRecall', {
      expectedResult: { ...getRecallResponse, warrantReferenceNumber, returnedToCustodyDateTime: undefined },
    })
    cy.clickButton('Continue')

    cy.getText('confirmation').should('equal', 'Warrant reference number has been added.')
    cy.clickLink('View')
    cy.recallInfo('Warrant reference number').should('equal', warrantReferenceNumber)
  })

  it('lets the user enter a return to custody date/time', () => {
    const recalls = [
      {
        ...getRecallResponse,
        status: 'AWAITING_RETURN_TO_CUSTODY',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        returnedToCustodyDateTime: undefined,
        returnedToCustodyNotificationDateTime: undefined,
      },
    ]
    cy.task('expectListRecalls', {
      expectedResults: recalls,
    })
    cy.task('expectAddReturnToCustodyDates')
    cy.visit('/')
    cy.clickLink('Not in custody (1)')
    cy.clickLink('Add RTC date')
    cy.enterDateTimeFromRecall('returnedToCustodyDateTime', { parent: '#returnedToCustodyDateTime' })
    cy.enterDateTimeFromRecall('returnedToCustodyNotificationDateTime', {
      parent: '#returnedToCustodyNotificationDateTime',
    })
    cy.clickButton('Save and return')
    cy.getText('confirmation').should('equal', 'Recall updated and moved to the to do list')
  })

  it('errors - return to custody dates', () => {
    cy.task('expectGetRecall', {
      expectedResult: getEmptyRecallResponse,
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'rtc-dates' })
    cy.clickButton('Save and return')
    cy.assertErrorMessage({
      fieldName: 'returnedToCustodyDateTime',
      summaryError: `Enter the date and time ${personName} returned to custody`,
    })
    cy.assertErrorMessage({
      fieldName: 'returnedToCustodyNotificationDateTime',
      summaryError: `Enter the date and time you found out ${personName} returned to custody`,
    })
  })

  it('shows if person has returned to custody on the recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: getRecallResponse,
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Custody status').should('equal', 'Returned to custody (RTC)')
    cy.getElement({ qaAttr: 'inCustodyAtBooking' }).should('not.exist')
    cy.getElement({ qaAttr: 'inCustodyAtAssessment' }).should('not.exist')
    cy.recallInfo('RTC date and time').should('equal', formatIsoDate(getRecallResponse.returnedToCustodyDateTime))
    cy.recallInfo('Found out RTC date and time').should(
      'equal',
      formatIsoDate(getRecallResponse.returnedToCustodyNotificationDateTime)
    )
    cy.recallInfo('Prison held in').should(
      'equal',
      getReferenceDataItemLabel('prisons', getRecallResponse.currentPrison)
    )
    cy.getLinkHref('Change current prison').should('contain', `/assess-prison?fromPage=view-recall&fromHash=custody`)
  })
})
