import { getPrisonList, getRecallResponse, searchResponse } from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallSentenceDetails'
import uploadDocumentsPage from '../pages/uploadDocuments'
import recallIssuesNeedsPage from '../pages/recallIssuesNeeds'
import { ApiRecallDocument } from '../../server/@types/manage-recalls-api/models/ApiRecallDocument'
import checkAnswersPage from '../pages/recallCheckAnswers'

const recallPreConsNamePage = require('../pages/recallPreConsName')
const recallRequestReceivedPage = require('../pages/recallRequestReceived')
const recallPrisonPolicePage = require('../pages/recallPrisonPolice')
const recallProbationOfficerPage = require('../pages/recallProbationOfficer')

context('Book a recall', () => {
  const recallId = '123'
  const personName = `${searchResponse[0].firstName} ${searchResponse[0].lastName}`
  let recallPreConsName

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
    cy.task('expectPrisonList', { expectedResults: getPrisonList })
    cy.login()
    recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
  })

  const nomsNumber = 'A1234AA'

  it('User can book a recall', () => {
    recallPreConsName.selectOtherName()
    recallPreConsName.enterOtherName('Wayne Holt')
    recallPreConsName.clickContinue()
    const recallRequestReceived = recallRequestReceivedPage.verifyOnPage()
    recallRequestReceived.enterDateTime({
      prefix: 'recallEmailReceivedDateTime',
      values: {
        Day: '10',
        Month: '05',
        Year: '2021',
        Hour: '05',
        Minute: '3',
      },
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
    const recallProbationOfficer = recallProbationOfficerPage.verifyOnPage()
    recallProbationOfficer.setProbationOfficerName()
    recallProbationOfficer.setProbationOfficerEmail()
    recallProbationOfficer.setProbationOfficerPhoneNumber()
    recallProbationOfficer.setLocalDeliveryUnit()
    recallProbationOfficer.setAssistantChiefOfficer()
    recallProbationOfficer.clickContinue()
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.upload()
    cy.task('expectGetRecall', { expectedResult: { recallId, ...getRecallResponse } })
    uploadDocuments.clickContinue()
    const checkAnswers = checkAnswersPage.verifyOnPage()
    // personal details
    checkAnswers.assertElementHasText({ qaAttr: 'name', textToFind: 'Bobby Badger' })
    checkAnswers.assertElementHasText({ qaAttr: 'dateOfBirth', textToFind: '28 May 1999' })
    checkAnswers.assertElementHasText({ qaAttr: 'gender', textToFind: 'Male' })
    checkAnswers.assertElementHasText({ qaAttr: 'nomsNumber', textToFind: nomsNumber })
    checkAnswers.assertElementHasText({ qaAttr: 'croNumber', textToFind: '1234/56A' })
    checkAnswers.assertElementHasText({ qaAttr: 'previousConvictionMainName', textToFind: 'Walter Holt' })
    // Recall request date and time
    checkAnswers.assertElementHasText({ qaAttr: 'recallEmailReceivedDateTime', textToFind: '5 December 2020 at 15:33' })
    // Sentence, offence and release details
    checkAnswers.assertElementHasText({ qaAttr: 'sentenceType', textToFind: 'Determinate' })
    checkAnswers.assertElementHasText({ qaAttr: 'sentenceDate', textToFind: '3 August 2019' })
    checkAnswers.assertElementHasText({ qaAttr: 'licenceExpiryDate', textToFind: '3 August 2021' })
    checkAnswers.assertElementHasText({ qaAttr: 'sentenceExpiryDate', textToFind: '3 February 2021' })
    checkAnswers.assertElementHasText({ qaAttr: 'sentenceLength', textToFind: '2 years 3 months' })
    checkAnswers.assertElementHasText({ qaAttr: 'sentencingCourt', textToFind: 'Manchester Crown Court' })
    checkAnswers.assertElementHasText({ qaAttr: 'indexOffence', textToFind: 'Burglary' })
    checkAnswers.assertElementHasText({ qaAttr: 'lastReleasePrison', textToFind: 'Kennet (HMP)' })
    checkAnswers.assertElementHasText({ qaAttr: 'bookingNumber', textToFind: 'A123456' })
    checkAnswers.assertElementHasText({ qaAttr: 'lastReleaseDate', textToFind: '3 August 2020' })
    checkAnswers.assertElementHasText({ qaAttr: 'conditionalReleaseDate', textToFind: '3 December 2021' })
    // local police force
    checkAnswers.assertElementHasText({ qaAttr: 'localPoliceForce', textToFind: 'Essex' })
    // issues or needs
    checkAnswers.assertElementHasText({ qaAttr: 'vulnerabilityDiversityDetail', textToFind: 'Various...' })
    checkAnswers.assertElementHasText({ qaAttr: 'contrabandDetail', textToFind: 'Intention to smuggle drugs' })
    checkAnswers.assertElementHasText({ qaAttr: 'mappaLevel', textToFind: 'Level 1' })
    // probation details
    checkAnswers.assertElementHasText({ qaAttr: 'probationOfficerName', textToFind: 'Dave Angel' })
    checkAnswers.assertElementHasText({ qaAttr: 'probationOfficerEmail', textToFind: 'probation.office@justice.com' })
    checkAnswers.assertElementHasText({ qaAttr: 'probationOfficerPhoneNumber', textToFind: '07473739388' })
    checkAnswers.assertElementHasText({ qaAttr: 'localDeliveryUnit', textToFind: 'Central Audit Team' })
    checkAnswers.assertElementHasText({ qaAttr: 'authorisingAssistantChiefOfficer', textToFind: 'Bob Monkfish' })

    // uploaded documents
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-LICENCE',
      textToFind: 'Licence.pdf',
    })
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      textToFind: 'Part A.pdf',
    })
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
      textToFind: 'Pre Cons.pdf',
    })
    checkAnswers.assertElementHasText({
      qaAttr: 'uploadedDocument-PRE_SENTENCING_REPORT',
      textToFind: 'PSR.pdf',
    })
  })

  it('User sees an error if pre-cons main name question is not answered', () => {
    recallPreConsName.clickContinue()
    recallPreConsName.assertErrorMessage({
      fieldName: 'hasOtherPreviousConvictionMainName',
      summaryError: 'What is the main name on the pre-cons?',
      fieldError: 'Select one',
    })
  })

  it('User sees an error if pre-cons other main name is not supplied', () => {
    recallPreConsName.selectOtherName()
    recallPreConsName.clickContinue()
    recallPreConsName.assertErrorMessage({
      fieldName: 'previousConvictionMainName',
      summaryError: 'What is the other main name used?',
      fieldError: 'Enter the main name',
    })
  })

  it('User sees an error if an invalid email received date is entered', () => {
    const recallRequestReceived = recallRequestReceivedPage.verifyOnPage({ nomsNumber, recallId })
    recallRequestReceived.enterDateTime({
      prefix: 'recallEmailReceivedDateTime',
      values: {
        Year: '2021',
        Hour: '05',
        Minute: '3',
      },
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
      fieldError: 'Enter a valid future date',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'licenceExpiryDate',
      summaryError: 'Licence expiry date',
      fieldError: 'Enter a valid future date',
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
      fieldName: 'localDeliveryUnit',
      summaryError: 'Local Delivery Unit',
      fieldError: 'Select the Local Delivery Unit',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'authorisingAssistantChiefOfficer',
      summaryError: 'Assistant Chief Officer',
      fieldError: "Enter the Assistant Chief Officer's name",
    })
  })

  it('User sees errors if upload fails', () => {
    cy.task('expectAddRecallDocument', { statusCode: 400 })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.upload()
    uploadDocuments.clickContinue()
    uploadDocuments.assertErrorMessage({
      fieldName: ApiRecallDocument.category.PART_A_RECALL_REPORT,
      summaryError: 'test.pdf - an error occurred during upload',
      fieldError: 'Upload a file',
    })
  })

  it('User sees errors if no documents are uploaded', () => {
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.clickContinue()
    uploadDocuments.assertErrorMessage({
      fieldName: ApiRecallDocument.category.PART_A_RECALL_REPORT,
      summaryError: 'Part A recall report',
      fieldError: 'Upload a file',
    })
    uploadDocuments.assertErrorMessage({
      fieldName: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
      summaryError: 'Previous convictions sheet',
      fieldError: 'Upload a file',
    })
  })

  it("User doesn't see errors for previously saved documents", () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          },
        ],
      },
    })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.clickContinue()
    uploadDocuments.assertErrorMessage({
      fieldName: ApiRecallDocument.category.PART_A_RECALL_REPORT,
      summaryError: 'Part A recall report',
      fieldError: 'Upload a file',
    })
    uploadDocuments.assertErrorNotShown({ fieldName: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET })
    uploadDocuments.assertElementHasText({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
      textToFind: 'Pre Cons.pdf',
    })
  })
})
