import { searchResponse, getRecallsResponse } from '../mockApis/mockResponses'
import recallPreConsNamePage from '../pages/recallPreConsName'
import assessRecallPage from '../pages/assessRecall'
import dossierLetterPage from '../pages/dossierLetter'

const findOffenderPage = require('../pages/findOffender')

context('Find a person', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'

  it('User can search for a person and create a booking', () => {
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { expectedResult: { recallId, documents: [] } })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
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
    const existingRecall1 = getRecallsResponse[0]
    firstResult.get(`[data-qa=assess-recall-${existingRecall1.recallId}]`)
    const existingRecall2 = getRecallsResponse[1]
    firstResult.get(`[data-qa=continue-booking-${existingRecall2.recallId}]`)
    const existingRecall3 = getRecallsResponse[2]
    firstResult.get(`[data-qa=create-dossier-${existingRecall3.recallId}]`)
    firstResult.get('[data-qa=bookRecallButton]').click()
    recallPreConsNamePage.verifyOnPage({ personName })
  })

  it('User can assess a recall', () => {
    const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectGetRecall', { expectedResult: { recallId, documents: [] } })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
    cy.login()
    const homePage = findOffenderPage.verifyOnPage(nomsNumber)
    const firstResult = homePage.searchResults().first()
    const existingRecall1 = getRecallsResponse[0]
    firstResult.get(`[data-qa=assess-recall-${existingRecall1.recallId}]`).click()
    assessRecallPage.verifyOnPage({ fullName: personName })
  })

  it('User can continue a booking', () => {
    const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectGetRecall', { expectedResult: { recallId, documents: [] } })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
    cy.login()
    const homePage = findOffenderPage.verifyOnPage(nomsNumber)
    const firstResult = homePage.searchResults().first()
    const existingRecall2 = getRecallsResponse[1]
    firstResult.get(`[data-qa=continue-booking-${existingRecall2.recallId}]`).click()
    recallPreConsNamePage.verifyOnPage({ personName })
  })

  it('User can create a dossier', () => {
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectGetRecall', { expectedResult: { recallId, documents: [] } })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
    cy.login()
    const homePage = findOffenderPage.verifyOnPage(nomsNumber)
    const firstResult = homePage.searchResults().first()
    const existingRecall3 = getRecallsResponse[2]
    firstResult.get(`[data-qa=create-dossier-${existingRecall3.recallId}]`).click()
    dossierLetterPage.verifyOnPage()
  })

  it('person search returns no results', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: [] })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
    cy.login()
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber)
    homePage.expectSearchResultsCountText('0 people found')
  })

  it('person search with an invalid NOMIS number returns an error', () => {
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: [] })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
    cy.login()
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor('A123')
    homePage.assertErrorMessage({
      fieldName: 'nomsNumber',
      summaryError: 'Enter a NOMIS number in the correct format',
    })
  })
})
