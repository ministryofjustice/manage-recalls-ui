import {
  getCourtsResponse,
  getLocalDeliveryUnitsResponse,
  getPrisonsResponse,
  getRecallResponse,
  searchResponse,
} from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallSentenceDetails'
import uploadDocumentsPage from '../pages/uploadDocuments'
import recallIssuesNeedsPage from '../pages/recallIssuesNeeds'
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
    cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
    cy.login()
  })

  const nomsNumber = 'A1234AA'

  it('User can book a recall', () => {
    recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallPreConsName.selectOtherName()
    recallPreConsName.enterOtherName('Wayne Holt')
    recallPreConsName.clickContinue()
    const recallRequestReceived = recallRequestReceivedPage.verifyOnPage()
    recallRequestReceived.clickTodayLink()
    recallRequestReceived.enterDateTime({
      prefix: 'recallEmailReceivedDateTime',
      values: {
        Hour: '00',
        Minute: '0',
      },
    })
    recallRequestReceived.uploadEmail({ fieldName: 'recallRequestEmailFileName', fileName: 'email.msg' })
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
    checkAnswers.assertElementHasText({ qaAttr: 'sentencingCourt', textToFind: 'Aberdare County Court' })
    checkAnswers.assertElementHasText({ qaAttr: 'indexOffence', textToFind: 'Burglary' })
    checkAnswers.assertElementHasText({ qaAttr: 'lastReleasePrison', textToFind: 'Kennet (HMP)' })
    checkAnswers.assertElementHasText({ qaAttr: 'bookingNumber', textToFind: 'A123456' })
    checkAnswers.assertElementHasText({ qaAttr: 'lastReleaseDate', textToFind: '3 August 2020' })
    checkAnswers.assertElementHasText({ qaAttr: 'conditionalReleaseDate', textToFind: '3 December 2021' })
    // local police force
    checkAnswers.assertElementHasText({ qaAttr: 'localPoliceForce', textToFind: 'Essex' })
    // issues or needs
    checkAnswers.assertElementHasText({ qaAttr: 'vulnerabilityDiversity', textToFind: 'Various...' })
    checkAnswers.assertElementHasText({ qaAttr: 'contraband', textToFind: 'Intention to smuggle drugs' })
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
    recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallPreConsName.clickContinue()
    recallPreConsName.assertErrorMessage({
      fieldName: 'hasOtherPreviousConvictionMainName',
      summaryError: "Is Bobby Badger's name different on the previous convictions report (pre-cons)?",
    })
  })

  it('User sees an error if pre-cons other main name is not supplied', () => {
    recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallPreConsName.selectOtherName()
    recallPreConsName.clickContinue()
    recallPreConsName.assertErrorMessage({
      fieldName: 'previousConvictionMainName',
      summaryError: 'Enter the name on the pre-cons',
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
    recallRequestReceived.assertErrorMessage({
      fieldName: 'recallEmailReceivedDateTime',
      summaryError: 'The date and time you received the recall email must include a day and month',
    })
  })

  it('User sees an error if a recall email is not uploaded', () => {
    const recallRequestReceived = recallRequestReceivedPage.verifyOnPage({ nomsNumber, recallId })
    recallRequestReceived.clickContinue()
    recallRequestReceived.assertErrorMessage({
      fieldName: 'recallRequestEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('User sees a previously saved recall request email', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            documentId: 'ea443809-4b29-445a-8c36-3ff259f48b03',
            category: 'RECALL_REQUEST_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    const recallRequestReceived = recallRequestReceivedPage.verifyOnPage({ nomsNumber, recallId })
    recallRequestReceived.assertElementHasText({
      qaAttr: 'uploadedDocument-RECALL_REQUEST_EMAIL',
      textToFind: 'email.msg',
    })
  })

  it('User sees errors if sentence, offence and release details are not entered', () => {
    const recallLastRelease = recallLastReleasePage.verifyOnPage({ nomsNumber, recallId })
    recallLastRelease.clickContinue()
    recallLastRelease.assertErrorMessage({
      fieldName: 'lastReleaseDate',
      summaryError: 'Enter the latest release date',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'lastReleasePrison',
      summaryError: 'Select a releasing prison',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentenceDate',
      summaryError: 'Enter the date of sentence',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentenceExpiryDate',
      summaryError: 'Enter the sentence expiry date',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'licenceExpiryDate',
      summaryError: 'Enter the licence expiry date',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentenceLength',
      summaryError: 'Enter the length of sentence',
    })
    recallLastRelease.assertErrorMessage({
      fieldName: 'bookingNumber',
      summaryError: 'Enter a booking number',
    })
  })

  it('User sees an error if invalid booking number is entered', () => {
    const recallLastRelease = recallLastReleasePage.verifyOnPage({ nomsNumber, recallId })
    recallLastRelease.setBookingNumber('12343')
    recallLastRelease.clickContinue()
    recallLastRelease.assertErrorMessage({
      fieldName: 'bookingNumber',
      summaryError: 'Enter a booking number in the correct format, like 12345C, A12347 or AB1234',
    })
  })

  it('User sees an error if Local police force not entered', () => {
    const recallPrisonPolice = recallPrisonPolicePage.verifyOnPage({ nomsNumber, recallId })
    recallPrisonPolice.clickContinue()
    recallPrisonPolice.assertErrorMessage({
      fieldName: 'localPoliceForce',
      summaryError: 'Select a local police force',
    })
  })

  it('User sees errors if vulnerability or diversity not answered', () => {
    const recallIssuesNeeds = recallIssuesNeedsPage.verifyOnPage({ nomsNumber, recallId })
    recallIssuesNeeds.clickContinue()
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'vulnerabilityDiversity',
      summaryError: 'Are there any vulnerability issues or diversity needs?',
    })
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'contraband',
      summaryError: `Do you think ${personName} will bring contraband into prison?`,
    })
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'mappaLevel',
      summaryError: 'Select a MAPPA level',
    })
  })

  it('User sees errors if vulnerability or diversity detail not provided', () => {
    const recallIssuesNeeds = recallIssuesNeedsPage.verifyOnPage({ nomsNumber, recallId })
    recallIssuesNeeds.setVulnerabilityDiversityYes()
    recallIssuesNeeds.setContrabandYes()
    recallIssuesNeeds.clickContinue()
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'vulnerabilityDiversityDetail',
      summaryError: 'Provide more detail for any vulnerability issues or diversity needs',
    })
    recallIssuesNeeds.assertErrorMessage({
      fieldName: 'contrabandDetail',
      summaryError: 'Provide more detail on why you think Bobby Badger will bring contraband into prison',
    })
  })

  it('User sees errors if probation officer details are not entered', () => {
    const recallProbationOfficer = recallProbationOfficerPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallProbationOfficer.clickContinue()
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerName',
      summaryError: 'Enter a name',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerEmail',
      summaryError: 'Enter an email',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerPhoneNumber',
      summaryError: 'Enter a phone number',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'localDeliveryUnit',
      summaryError: 'Select a Local Delivery Unit',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'authorisingAssistantChiefOfficer',
      summaryError: 'Enter the Assistant Chief Officer that signed-off the recall',
    })
  })

  it('User sees errors if invalid probation officer email and phone are entered', () => {
    const recallProbationOfficer = recallProbationOfficerPage.verifyOnPage({ nomsNumber, recallId, personName })
    recallProbationOfficer.setProbationOfficerEmail('invalid@email')
    recallProbationOfficer.setProbationOfficerPhoneNumber('12343')
    recallProbationOfficer.clickContinue()
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerEmail',
      summaryError: 'Enter an email address in the correct format, like name@example.com',
    })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'probationOfficerPhoneNumber',
      summaryError: 'Enter a phone number in the correct format, like 01277 960901',
    })
  })

  it('User sees an error if an upload fails', () => {
    cy.task('expectAddRecallDocument', { statusCode: 400 })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.upload()
    uploadDocuments.assertSummaryErrorMessage({
      fieldName: 'documents',
      summaryError: 'test.pdf could not be uploaded - try again',
    })
  })

  it('User sees previously saved documents', () => {
    const documentId = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        documents: [
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            documentId,
          },
        ],
      },
    })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage({ nomsNumber, recallId })
    uploadDocuments.assertElementHasText({
      qaAttr: `link-${documentId}`,
      textToFind: 'Pre Cons.pdf',
    })
    uploadDocuments.assertSelectValue({
      fieldName: `category-${documentId}`,
      value: 'PREVIOUS_CONVICTIONS_SHEET',
    })
  })

  it('user can check and change their answers then navigate back to the check answers page', () => {
    cy.task('expectGetRecall', { expectedResult: { recallId, ...getRecallResponse } })
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId })
    checkAnswers.checkChangeLinks()
    checkAnswers.clickElement({ qaAttr: 'previousConvictionMainNameChange' })
    recallPreConsName = recallPreConsNamePage.verifyOnPage({ personName })
    recallPreConsName.selectOtherName()
    recallPreConsName.enterOtherName('Walter Holt')
    recallPreConsName.clickContinue()
    checkAnswersPage.verifyOnPage()
    checkAnswers.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.clickElement({ qaAttr: 'backLinkUploadDocuments' })
    checkAnswersPage.verifyOnPage()
  })
})
