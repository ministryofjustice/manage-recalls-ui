import { searchResponse } from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallSentenceDetails'
import uploadDocumentsPage from '../pages/uploadDocuments'
import assessRecallPage from '../pages/assessRecall'
import recallIssuesNeedsPage from '../pages/recallIssuesNeeds'

const recallRequestReceivedPage = require('../pages/recallRequestReceived')
const recallPrisonPolicePage = require('../pages/recallPrisonPolice')
const recallProbationOfficerPage = require('../pages/recallProbationOfficer')

context('Book a recall', () => {
  const recallId = '123'
  const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
  let recallRequestReceived

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', { expectedResults: [] })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { expectedResult: { recallId, documents: [] } })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectAddRecallDocument', { statusCode: 201 })
    cy.login()
    recallRequestReceived = recallRequestReceivedPage.verifyOnPage({ nomsNumber, recallId })
  })

  const nomsNumber = 'A1234AA'

  it('User can book a recall', () => {
    recallRequestReceived.enterRecallReceivedDate({
      recallEmailReceivedDateTimeDay: '10',
      recallEmailReceivedDateTimeMonth: '05',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '05',
      recallEmailReceivedDateTimeMinute: '3',
    })
    recallRequestReceived.clickContinue()
    const recallLastRelease = recallLastReleasePage.verifyOnPage()
    recallLastRelease.setSentenceDate()
    recallLastRelease.setSentenceExpiryDate()
    recallLastRelease.setLicenceExpiryDate()
    recallLastRelease.setSentenceLength()
    recallLastRelease.setConditionalReleaseExpiryDate()
    recallLastRelease.setReleasingPrison()
    recallLastRelease.setLastReleaseDate()
    recallLastRelease.setSentencingCourt()
    recallLastRelease.setIndexOffence()
    recallLastRelease.setBookingNumber()
    recallLastRelease.clickContinue()
    const recallPrisonPolice = recallPrisonPolicePage.verifyOnPage()
    recallPrisonPolice.setlocalPoliceForce()
    recallPrisonPolice.clickContinue()
    const recallIssuesNeeds = recallIssuesNeedsPage.verifyOnPage()
    recallIssuesNeeds.setVulnerabilityDiversityNo()
    recallIssuesNeeds.setContrabandNo()
    recallIssuesNeeds.setMappaLevel()
    recallIssuesNeeds.clickContinue()
    const recallProbationOfficer = recallProbationOfficerPage.verifyOnPage({ personName })
    recallProbationOfficer.setProbationOfficerName()
    recallProbationOfficer.setProbationOfficerEmail()
    recallProbationOfficer.setProbationOfficerPhoneNumber()
    recallProbationOfficer.setProbationDivision()
    recallProbationOfficer.setAssistantChiefOfficer()
    recallProbationOfficer.clickContinue()
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.upload()
    assessRecallPage.verifyOnPage({ fullName: 'Bobby Badger' })
  })

  it('User sees an error if an invalid email received date is entered', () => {
    recallRequestReceived.enterRecallReceivedDate({
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '05',
      recallEmailReceivedDateTimeMinute: '3',
    })
    recallRequestReceived.clickContinue()
    recallRequestReceived.expectError('recallEmailReceivedDateTime')
  })

  it('User sees errors if sentence, offence and release details are not entered', () => {
    const recallLastRelease = recallLastReleasePage.verifyOnPage({ nomsNumber, recallId })
    recallLastRelease.clickContinue()
    recallLastRelease.assertErrorMessage({
      fieldName: 'lastReleaseDate',
      summaryError: 'Latest release date',
      fieldError: 'Enter a valid date in the past',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'lastReleasePrison',
      summaryError: 'Releasing prison',
      fieldError: 'Enter a prison name',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentenceDate',
      summaryError: 'Date of sentence',
      fieldError: 'Enter a valid date in the past',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentenceExpiryDate',
      summaryError: 'Sentence expiry date',
      fieldError: 'Enter a valid date',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'licenceExpiryDate',
      summaryError: 'Licence expiry date',
      fieldError: 'Enter a valid date',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentenceLength',
      summaryError: 'Length of sentence',
      fieldError: 'Enter a valid sentence length',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'bookingNumber',
      summaryError: 'Booking number',
      fieldError: 'Enter a booking number',
    })
  })

  it('User sees an error if Local police force not entered', () => {
    const recallPrisonPolice = recallPrisonPolicePage.verifyOnPage({ nomsNumber, recallId })
    recallPrisonPolice.clickContinue()
    recallPrisonPolice.expectError()
  })

  it('User sees errors if vulnerability or diversity not answered', () => {
    const recallIssuesNeeds = recallIssuesNeedsPage.verifyOnPage({ nomsNumber, recallId })
    recallIssuesNeeds.clickContinue()
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'vulnerabilityDiversity',
      summaryError: 'Vulnerability issues or diversity needs',
      fieldError: 'Answer whether there are any vulnerability issues or diversity needs',
    })
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'contraband',
      summaryError: 'Contraband',
      fieldError: `Answer whether you think ${personName} will bring contraband into prison`,
    })
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'mappaLevel',
      summaryError: 'MAPPA level',
      fieldError: 'Please select MAPPA level',
    })
  })

  it('User sees errors if probation officer details are not entered', () => {
    const recallProbationOfficer = recallProbationOfficerPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallProbationOfficer.clickContinue()
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerName',
      summaryError: "Probation officer's name",
      fieldError: "Enter the probation officer's name",
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerEmail',
      summaryError: "Probation officer's email",
      fieldError: "Enter the probation officer's email",
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerPhoneNumber',
      summaryError: "Probation officer's phone number",
      fieldError: "Enter the probation officer's phone number",
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationDivision',
      summaryError: 'Probation division',
      fieldError: 'Select the probation division',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'authorisingAssistantChiefOfficer',
      summaryError: 'Assistant Chief Officer',
      fieldError: "Enter the Assistant Chief Officer's name",
    })
  })

  it('User sees an error if upload fails', () => {
    cy.task('expectAddRecallDocument', { statusCode: 400 })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.upload()
    uploadDocuments.expectUploadedDocumentError()
  })
})
