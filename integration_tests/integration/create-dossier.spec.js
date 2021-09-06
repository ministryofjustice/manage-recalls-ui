import { getRecallResponse, searchResponse } from '../mockApis/mockResponses'

import recallsListPage from '../pages/recallsList'

const dossierLetterPage = require('../pages/dossierLetter')
const dossierConfirmationPage = require('../pages/dossierConfirmation')
const assessRecallPage = require('../pages/assessRecall')

context('Create a dossier', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = 'Bobby Badger'
  const status = 'RECALL_NOTIFICATION_ISSUED'

  it('User can create a dossier', () => {
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
        },
      ],
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getRecallResponse, recallId } })
    cy.task('expectUpdateRecall', recallId)
    cy.login()
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.createDossier({ recallId })
    const dossierLetter = dossierLetterPage.verifyOnPage()
    dossierLetter.additionalLicenceConditions()
    dossierLetter.addLicenceDetail()
    dossierLetter.differentNomsNumber()
    dossierLetter.addNomsDetail()
    dossierLetter.clickContinue()
    dossierConfirmationPage.verifyOnPage()
    const assessRecall = assessRecallPage.verifyOnPage({ nomsNumber, recallId, fullName: personName })
    assessRecall.assertElementHasText({ qaAttr: 'additionalLicenceConditions', textToFind: 'Yes' })
    assessRecall.assertElementHasText({ qaAttr: 'additionalLicenceConditionsDetail', textToFind: 'one, two' })
    assessRecall.assertElementHasText({ qaAttr: 'differentNomsNumber', textToFind: 'Yes' })
    assessRecall.assertElementHasText({ qaAttr: 'differentNomsNumberDetail', textToFind: 'AC3408303' })
  })
})
