import { getEmptyRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'

const findOffenderPage = require('../pages/findOffender')

context('Find a person', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const newRecall = { ...getEmptyRecallResponse, recallId }
  const personName = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.lastName}`

  beforeEach(() => {
    cy.login()
  })

  it('can search for a person and create a booking', () => {
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { expectedResult: newRecall })
    const homePage = findOffenderPage.verifyOnPage()

    // no results
    const nomsNumber2 = 'B1234CD'
    cy.task('expectPrisonerResult', { expectedPrisonerResult: null })
    homePage.searchFor(nomsNumber2)
    homePage.expectSearchResultsCountText('0 people found')

    // invalid NOMIS number returns an error
    homePage.searchFor('A123')
    homePage.assertErrorMessage({
      fieldName: 'nomsNumber',
      summaryError: 'Enter a NOMIS number in the correct format',
    })

    // Expect a single result returned
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('1 person found')
    homePage.searchResults().find('tr').should('have.length', 1)
    const firstResult = homePage.searchResults().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=name]').should('contain.text', personName)
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '28 May 1999')
    firstResult.get('[data-qa=bookRecallButton]').click()
    cy.pageHeading().should('equal', `How does ${personName}'s name appear on the licence?`)
    cy.getLinkHref('Back').should('contain', '/find-person')
  })

  it('person search errors', () => {
    // no results
    const nomsNumber2 = 'B1234CD'
    cy.task('expectPrisonerResult', { status: 404 })
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber2)
    homePage.expectSearchResultsCountText('0 people found')

    // invalid NOMIS number
    homePage.searchFor('A123')
    homePage.assertErrorMessage({
      fieldName: 'nomsNumber',
      summaryError: 'Enter a NOMIS number in the correct format',
    })
  })
})
