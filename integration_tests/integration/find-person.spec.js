import {
  getPrisonerResponse,
  getRecallsResponse,
  getRecallResponse,
  getEmptyRecallResponse,
} from '../mockApis/mockResponses'
import assessRecallPage from '../pages/assessRecall'
import dossierRecallInformationPage from '../pages/dossierRecallInformation'

const findOffenderPage = require('../pages/findOffender')

context('Find a person', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const newRecall = { ...getEmptyRecallResponse, recallId }
  const personName = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.lastName}`

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectAssignUserToRecall', { expectedResult: getRecallResponse })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
    cy.login()
  })

  it('User can search for a person and create a booking', () => {
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber, expectedResults: getRecallsResponse })
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
    cy.pageHeading().should('equal', `How does ${personName}'s name appear on the licence?`)
  })

  it('User can assess a recall', () => {
    const homePage = findOffenderPage.verifyOnPage(nomsNumber)
    const firstResult = homePage.searchResults().first()
    const existingRecall1 = getRecallsResponse[0]
    firstResult.get(`[data-qa=assess-recall-${existingRecall1.recallId}]`).click()
    assessRecallPage.verifyOnPage({ fullName: personName })
  })

  it('User can continue a booking', () => {
    const homePage = findOffenderPage.verifyOnPage(nomsNumber)
    const firstResult = homePage.searchResults().first()
    const existingRecall2 = getRecallsResponse[1]
    firstResult.get(`[data-qa=continue-booking-${existingRecall2.recallId}]`).click()
    cy.pageHeading().should(
      'equal',
      `How does ${personName}'s name appear on the previous convictions sheet (pre-cons)?`
    )
  })

  it('User can create a dossier', () => {
    const homePage = findOffenderPage.verifyOnPage(nomsNumber)
    const firstResult = homePage.searchResults().first()
    const existingRecall3 = getRecallsResponse[2]
    firstResult.get(`[data-qa=create-dossier-${existingRecall3.recallId}]`).click()
    dossierRecallInformationPage.verifyOnPage({ personName })
  })

  it('person search returns no results', () => {
    const nomsNumber2 = 'B1234CD'
    cy.task('expectPrisonerResult', { status: 404 })
    cy.task('expectSearchRecalls', { expectedSearchTerm: nomsNumber2, expectedResults: [] })
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor(nomsNumber2)
    homePage.expectSearchResultsCountText('0 people found')
  })

  it('person search with an invalid NOMIS number returns an error', () => {
    const homePage = findOffenderPage.verifyOnPage()
    homePage.searchFor('A123')
    homePage.assertErrorMessage({
      fieldName: 'nomsNumber',
      summaryError: 'Enter a NOMIS number in the correct format',
    })
  })
})
