import { searchResponse } from '../mockApis/mockResponses'
import recallRequestReceivedPage from '../pages/recallRequestReceived'

const findOffenderPage = require('../pages/findOffender')

context('Search for offenders', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  it('User can search for a prisoner', () => {
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.login()
    const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('1 person found')
    homePage.searchResults().find('tr').should('have.length', 1)
    const firstResult = homePage.searchResults().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=name]').should('contain.text', personName)
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '28 May 1999')
    firstResult.get('[data-qa=bookRecallButton]').click()
    recallRequestReceivedPage.verifyOnPage()
  })

  it('prisoner search returns no results', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: [] })
    cy.login()

    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('0 people found')
  })
})
