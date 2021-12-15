import {
  getCourtsResponse,
  getEmptyRecallResponse,
  getLocalDeliveryUnitsResponse,
  getPoliceForcesResponse,
  getPrisonsResponse,
  getRecallResponse,
  searchResponse,
} from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallSentenceDetails'
import uploadDocumentsPage from '../pages/uploadDocuments'
import recallIssuesNeedsPage from '../pages/recallIssuesNeeds'
import checkAnswersPage from '../pages/recallCheckAnswers'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import recallLicenceNamePage from '../pages/recallLicenceName'
import recallsListPage from '../pages/recallsList'

const recallPreConsNamePage = require('../pages/recallPreConsName')
const recallRequestReceivedPage = require('../pages/recallRequestReceived')
const recallPrisonPolicePage = require('../pages/recallPrisonPolice')
const recallProbationOfficerPage = require('../pages/recallProbationOfficer')
const recallMissingDocumentsPage = require('../pages/recallMissingDocuments')
const recallConfirmationPage = require('../pages/recallConfirmation')

context('Book a recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getRecallResponse.firstName} ${getRecallResponse.lastName}`
  const newRecall = { ...getEmptyRecallResponse, recallId }
  const status = 'BEING_BOOKED_ON'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [
        {
          recallId,
          nomsNumber,
          status,
          firstName: 'Bobby',
          lastName: 'Badger',
        },
      ],
    })
    cy.task('expectSearchResults', { expectedSearchTerm: nomsNumber, expectedSearchResults: searchResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.task('expectUpdateRecall', recallId)
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.task('expectAddMissingDocumentsRecord', { statusCode: 201 })
    cy.task('expectSetDocumentCategory')
    cy.task('expectRefData', { refDataPath: 'local-delivery-units', expectedResult: getLocalDeliveryUnitsResponse })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.task('expectRefData', { refDataPath: 'police-forces', expectedResult: getPoliceForcesResponse })
    cy.task('expectRefData', { refDataPath: 'courts', expectedResult: getCourtsResponse })
    cy.login()
  })

  it('User can book a recall', () => {
    const recallsList = recallsListPage.verifyOnPage()
    recallsList.continueBooking({ recallId })
    const recallLicenceName = recallLicenceNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallLicenceName.selectMiddleName()
    recallLicenceName.clickContinue()
    const recallPreConsName = recallPreConsNamePage.verifyOnPage({ personName })
    recallPreConsName.showPreConsOptions([
      { label: 'Bobby Badger', value: 'FIRST_LAST' },
      { label: 'Bobby Dave Badger', value: 'FIRST_MIDDLE_LAST' },
      { label: 'Other name', value: 'OTHER' },
    ])
    recallPreConsName.selectOtherName()
    recallPreConsName.enterOtherName('Wayne Holt')
    recallPreConsName.clickContinue()
    const recallRequestReceived = recallRequestReceivedPage.verifyOnPage()
    recallRequestReceived.clickTodayLink()
    recallRequestReceived.enterDateTime({
      prefix: 'recallEmailReceivedDateTime',
      values: {
        Hour: '00',
        Minute: '00',
      },
    })
    recallRequestReceived.uploadFile({ fieldName: 'recallRequestEmailFileName', fileName: 'email.msg' })
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
    recallPrisonPolice.setLocalPoliceForceId()
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
    uploadDocuments.clickContinue()
    const recallMissingDocuments = recallMissingDocumentsPage.verifyOnPage()
    recallMissingDocuments.enterTextInInput({ name: 'missingDocumentsDetail', text: 'I sent an email' })
    recallMissingDocuments.uploadFile({ fieldName: 'missingDocumentsEmailFileName', fileName: 'email.msg' })
    recallMissingDocuments.clickContinue()
    const checkAnswers = checkAnswersPage.verifyOnPage()
    checkAnswers.clickContinue()
    recallConfirmationPage.verifyOnPage({ personName })
  })

  it('User can check their answers', () => {
    // eslint-disable-next-line no-unused-vars
    const [licence, ...documents] = [...getRecallResponse.documents]
    cy.task('expectGetRecall', {
      expectedResult: { recallId, ...getRecallResponse, documents, status: RecallResponse.status.BEING_BOOKED_ON },
    })
    const checkAnswers = checkAnswersPage.verifyOnPage({ recallId, nomsNumber })
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
    checkAnswers.assertElementHasText({ qaAttr: 'localPoliceForce', textToFind: 'Devon & Cornwall Police' })
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

    // missing documents
    checkAnswers.assertElementHasText({ qaAttr: 'required-LICENCE', textToFind: 'Missing: needed to create dossier' })
  })

  it("User doesn't see a middle name option for pre-cons name if the person doesn't have one", () => {
    cy.task('expectGetRecall', {
      expectedResult: { recallId, ...getRecallResponse, middleNames: '' },
    })
    const recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallPreConsName.showPreConsOptions([
      { label: 'Bobby Badger', value: 'FIRST_LAST' },
      { label: 'Other name', value: 'OTHER' },
    ])
  })

  it('User sees an error if pre-cons main name question is not answered', () => {
    const recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallPreConsName.clickContinue()
    recallPreConsName.assertErrorMessage({
      fieldName: 'previousConvictionMainNameCategory',
      summaryError: "How does Bobby Badger's name appear on the previous convictions sheet (pre-cons)?",
    })
  })

  it('User sees an error if pre-cons other main name is not supplied', () => {
    const recallPreConsName = recallPreConsNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallPreConsName.selectOtherName()
    recallPreConsName.clickContinue()
    recallPreConsName.assertErrorMessage({
      fieldName: 'previousConvictionMainName',
      summaryError: 'Enter the full name on the pre-cons',
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
      fieldName: 'sentencingCourt',
      summaryError: 'Select a sentencing court',
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

  it('User sees invalid inputs for sentencing court or releasing prison', () => {
    const recallLastRelease = recallLastReleasePage.verifyOnPage({ nomsNumber, recallId })
    cy.get('[id="sentencingCourt"]').clear().type('blah blah blah')
    cy.get('[id="lastReleasePrison"]').clear().type('piffle')
    recallLastRelease.clickContinue()
    recallLastRelease.assertSelectValue({ fieldName: 'sentencingCourtInput', value: 'blah blah blah' })
    recallLastRelease.assertErrorMessage({
      fieldName: 'sentencingCourt',
      summaryError: 'Select a sentencing court from the list',
    })
    recallLastRelease.assertSelectValue({ fieldName: 'lastReleasePrisonInput', value: 'piffle' })
    recallLastRelease.assertErrorMessage({
      fieldName: 'lastReleasePrison',
      summaryError: 'Select a releasing prison from the list',
    })
  })

  it('User sees an error if Local Police Force not entered', () => {
    const recallPrisonPolice = recallPrisonPolicePage.verifyOnPage({ nomsNumber, recallId })
    recallPrisonPolice.clickContinue()
    recallPrisonPolice.assertErrorMessage({
      fieldName: 'localPoliceForceId',
      summaryError: 'Select a local police force',
    })
  })

  it('User sees error and text as entered if invalid Local Police Force is entered', () => {
    const recallPrisonPolice = recallPrisonPolicePage.verifyOnPage({ nomsNumber, recallId })
    recallPrisonPolice.enterLocalPoliceForceId('foobar')
    recallPrisonPolice.clickContinue()
    recallPrisonPolice.assertSelectValue({ fieldName: 'localPoliceForceIdInput', value: 'foobar' })
    recallPrisonPolice.assertErrorMessage({
      fieldName: 'localPoliceForceId',
      summaryError: 'Select a local police force from the list',
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

  it('User sees an invalid input for local delivery unit', () => {
    const recallProbationOfficer = recallProbationOfficerPage.verifyOnPage({ nomsNumber, recallId, personName })
    cy.get('[id="localDeliveryUnit"]').clear().type('blah blah blah')
    recallProbationOfficer.clickContinue()
    recallProbationOfficer.assertSelectValue({ fieldName: 'localDeliveryUnitInput', value: 'blah blah blah' })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'localDeliveryUnit',
      summaryError: 'Select a Local Delivery Unit from the list',
    })
  })

  it('user can check and change their answers then navigate back to the check answers page', () => {
    cy.task('expectGetRecall', {
      expectedResult: { recallId, ...getRecallResponse, status: RecallResponse.status.BEING_BOOKED_ON },
    })
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId })
    checkAnswers.checkChangeLinks()
    checkAnswers.clickElement({ qaAttr: 'previousConvictionMainNameChange' })
    const recallPreConsName = recallPreConsNamePage.verifyOnPage({ personName })
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
