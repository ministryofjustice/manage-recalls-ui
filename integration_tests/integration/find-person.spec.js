import { getEmptyRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'

context('Find a person', () => {
  const recallId = '123'
  const newRecall = { ...getEmptyRecallResponse, recallId }
  const personName = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.lastName}`

  beforeEach(() => {
    cy.login()
  })

  it('can search for a person and create a booking', () => {
    // no results
    const nomsNumber = 'A1234AA'
    cy.task('expectPrisonerResult', { status: 404 })
    cy.visitPage('/find-person')
    cy.fillInput('NOMIS number', nomsNumber)
    cy.clickButton('Search')
    cy.getText('search-results-count').should('equal', '0 people found')
    cy.getTextInputValue('NOMIS number').should('equal', nomsNumber)

    // invalid NOMIS number
    const invalidNoms = 'A123'
    cy.fillInput('NOMIS number', invalidNoms, { clearExistingText: true })
    cy.clickButton('Search')
    cy.assertErrorMessage({
      fieldName: 'nomsNumber',
      summaryError: 'Enter a NOMIS number in the correct format',
    })
    cy.getTextInputValue('NOMIS number').should('equal', invalidNoms)

    // Expect a single result returned
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.visitPage('/find-person')
    cy.fillInput('NOMIS number', nomsNumber, { clearExistingText: true })
    cy.clickButton('Search')
    cy.getText('search-results-count').should('equal', '1 person found')
    cy.get('[data-qa=search-results]').find('tr').should('have.length', 1)
    cy.getRowValuesFromTable({ rowQaAttr: `result-${nomsNumber}` }).then(rowValues =>
      expect(rowValues).to.include.members([nomsNumber, getPrisonerResponse.croNumber, personName, '28 May 1999'])
    )
    cy.clickButton(`Book a recall for ${personName}`)
    cy.pageHeading().should('equal', `How does ${personName}'s name appear on the licence?`)
    cy.getLinkHref('Back').should('contain', '/find-person')
  })

  it("redirects to user details page if they haven't entered any", () => {
    cy.task('expectGetCurrentUserDetails', { status: 404, expectedResult: { status: 'NOT_FOUND' } })
    cy.visit('/find-person')
    cy.pageHeading().should('equal', 'User details')
  })
})
