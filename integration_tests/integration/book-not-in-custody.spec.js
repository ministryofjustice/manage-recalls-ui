import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'

context('Book a "not in custody" recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getRecallResponse.firstName} ${getRecallResponse.lastName}`
  const status = 'BEING_BOOKED_ON'
  const newRecall = { ...getEmptyRecallResponse, recallId, status }

  beforeEach(() => {
    cy.login()
    cy.task('expectUpdateRecall', recallId)
  })

  it('user can book a not in custody recall', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.task('expectAddLastKnownAddress')
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'custody-status' })
    cy.selectRadio('Is Bobby Badger in custody?', 'No')
    cy.clickButton('Continue')
    cy.selectRadio(`Does ${personName} have a last known address?`, 'Yes')
    cy.clickButton('Continue')
    // add an address
    cy.pageHeading('Add an address')
    cy.fillInput('Address line 1', '345 Porchester Road')
    cy.fillInput('Address line 2', 'Southsea')
    cy.fillInput('Town or city', 'Portsmouth')
    cy.fillInput('Postcode', 'PO1 4OY')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'When did you receive the recall request?')
  })

  it('no fixed abode', () => {
    cy.task('expectGetRecall', { expectedResult: getRecallResponse })
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'last-known-address' })
    cy.selectRadio(`Does ${personName} have a last known address?`, 'No')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'When did you receive the recall request?')
  })

  it('shows if person has last known addresses and arrest issues on the recall info page', () => {
    const lastKnownAddresses = [
      {
        line1: '345 Porchester Road',
        line2: 'Southsea',
        town: 'Portsmouth',
        postcode: 'PO1 4OY',
        index: 0,
        id: '345',
      },
      {
        line1: 'The Oaks, Amblin Road',
        line2: '',
        town: 'Birmingham',
        postcode: 'B3 5HU',
        index: 1,
        id: '678',
      },
    ]
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        inCustody: false,
        lastKnownAddressOption: 'YES',
        lastKnownAddresses,
      },
    })
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'view-recall' })
    const addressId = lastKnownAddresses[0].id
    cy.getText(`address-${addressId}-line1`).should('equal', '345 Porchester Road')
    cy.getText(`address-${addressId}-line2`).should('equal', 'Southsea')
    cy.getText(`address-${addressId}-town`).should('equal', 'Portsmouth')
    cy.getText(`address-${addressId}-postcode`).should('equal', 'PO1 4OY')
    const addressId2 = lastKnownAddresses[1].id
    cy.getText(`address-${addressId2}-line1`).should('equal', 'The Oaks, Amblin Road')
    cy.getText(`address-${addressId2}-town`).should('equal', 'Birmingham')
    cy.getText(`address-${addressId2}-postcode`).should('equal', 'B3 5HU')
    cy.recallInfo('Arrest issues', 'Detail...')
  })

  it('shows if person has no last known address on the recall info page', () => {
    cy.task('expectGetRecall', {
      expectedResult: { ...newRecall, inCustody: false, lastKnownAddressOption: 'NO_FIXED_ABODE' },
    })
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'view-recall' })
    cy.recallInfo('Address').should('equal', 'No fixed abode')
    cy.getElement({ qaAttr: 'lastKnownAddressOptionChange' }).should(
      'have.attr',
      'href',
      '/persons/A1234AA/recalls/123/last-known-address?fromPage=view-recall&fromHash=personalDetails'
    )
  })
})
