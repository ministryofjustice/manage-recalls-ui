import { getEmptyRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'

const findOffenderPage = require('../pages/findOffender')

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
    const firstResult = cy.get('[data-qa=search-results]').find('tr').first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=name]').should('contain.text', personName)
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '28 May 1999')
    firstResult.get('[data-qa=bookRecallButton]').click()
    cy.pageHeading().should('equal', `How does ${personName}'s name appear on the licence?`)
    cy.getLinkHref('Back').should('contain', '/find-person')
  })
})
