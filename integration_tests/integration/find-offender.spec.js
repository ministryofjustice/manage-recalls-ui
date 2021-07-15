const findOffenderPage = require('../pages/findOffender')
const offenderProfilePage = require('../pages/offenderProfile')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const searchResponseJson = require('../../fake-manage-recalls-api/stubs/__files/search.json')

context('Search for offenders', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  it('User can search for a prisoner', () => {
    expectSearchResultsFromManageRecallsApi(nomsNumber, searchResponseJson)
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.login()
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('1 person found')
    homePage.searchResults().find('tr').should('have.length', 1)
    const firstResult = homePage.searchResults().first()
    firstResult.get('[data-qa=nomsNumber]').should('contain.text', nomsNumber)
    firstResult.get('[data-qa=firstName]').should('contain.text', 'Bobby')
    firstResult.get('[data-qa=lastName]').should('contain.text', 'Badger')
    firstResult.get('[data-qa=dateOfBirth]').should('contain.text', '28 May 1999')
    firstResult.get('[data-qa=viewProfileButton]').click()
    offenderProfilePage.verifyOnPage()
  })

  it('prisoner search returns no results', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.login()
    expectSearchResultsFromManageRecallsApi(nomsNumber, [])

    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('0 people found')
  })

  function expectSearchResultsFromManageRecallsApi(expectedSearchTerm, expectedSearchResults) {
    cy.task('expectSearchResults', { expectedSearchTerm, expectedSearchResults })
  }
})
