import { getEmptyRecallResponse, getRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'

context('Book a "not in custody" recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getRecallResponse.firstName} ${getRecallResponse.lastName}`
  const status = 'BEING_BOOKED_ON'
  const newRecall = { ...getEmptyRecallResponse, recallId, status }

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.task('expectUpdateRecall', recallId)
    cy.login()
  })

  it('user can book a not in custody recall', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'custody-status' })
    cy.selectRadio('Is Bobby Badger in custody?', 'No')
    cy.clickButton('Continue')
    cy.selectRadio(`Does ${personName} have a last known address?`, 'Yes')
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', `When did you receive the recall request?`)
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
