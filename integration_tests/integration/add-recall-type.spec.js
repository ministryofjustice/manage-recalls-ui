import { searchResponse, getRecallResponse } from '../mockApis/mockResponses'

const addRecallTypePage = require('../pages/addRecallType')
const uploadDocumentsPage = require('../pages/uploadDocuments')

context('Add recall length', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'

  it('User can add a recall type and length', () => {
    const { recallId } = getRecallResponse
    const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`

    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: getRecallResponse })
    cy.task('expectUpdateRecall', recallId)

    cy.login()

    const addRecallType = addRecallTypePage.verifyOnPage({ nomsNumber, recallId, personName })
    addRecallType.expectPersonNameInCaption(personName)

    cy.get('[type="radio"]').check('FOURTEEN_DAYS')
    addRecallType.addRecallType()

    uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
  })
})
