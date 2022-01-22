import {
  getCourtsResponse,
  getEmptyRecallResponse,
  getLocalDeliveryUnitsResponse,
  getPoliceForcesResponse,
  getPrisonsResponse,
  getRecallResponse,
  getPrisonerResponse,
} from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallSentenceDetails'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import recallLicenceNamePage from '../pages/recallLicenceName'
import { booleanToYesNo } from '../support/utils'

const recallPreConsNamePage = require('../pages/recallPreConsName')
const recallRequestReceivedPage = require('../pages/recallRequestReceived')
const recallPrisonPolicePage = require('../pages/recallPrisonPolice')
const recallProbationOfficerPage = require('../pages/recallProbationOfficer')
const { recall } = require('../fixtures')

context('Book an in-custody recall', () => {
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
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
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

  it('User can book an in-custody recall recall', () => {
    cy.visit(`/find-person?nomsNumber=${nomsNumber}`)
    cy.clickButton('Book a recall')

    // licence name
    cy.selectRadio(`How does ${personName}'s name appear on the licence?`, personName)
    cy.clickButton('Continue')

    // pre-cons name
    cy.selectRadio(
      `How does ${personName}'s name appear on the previous convictions sheet (pre-cons)?`,
      'Bobby Dave Badger'
    )
    cy.clickButton('Continue')

    // custody status
    cy.selectRadio('Is Bobby Badger in custody?', 'Yes')
    cy.clickButton('Continue')

    // recall request
    cy.enterDateTimeForToday()
    cy.uploadEmail({ field: 'recallRequestEmailFileName' })
    cy.clickButton('Continue')

    // sentence details
    cy.enterDateTimeFromRecall('sentenceDate')
    cy.enterDateTimeFromRecall('licenceExpiryDate')
    cy.enterDateTimeFromRecall('sentenceExpiryDate')
    const { years, months, days } = recall.sentenceLength
    cy.fillInputGroup({ Years: years, Months: months, Days: days }, { parent: '#sentenceLength' })
    cy.selectFromAutocomplete('Sentencing court', recall.sentencingCourtLabel)
    cy.selectFromAutocomplete('Releasing prison', recall.lastReleasePrisonLabel)
    cy.fillInput('Index offence', recall.indexOffence)
    cy.fillInput('Booking number', recall.bookingNumber)
    cy.enterDateTimeFromRecall('lastReleaseDate')
    cy.enterDateTimeFromRecall('conditionalReleaseDate')
    cy.clickButton('Continue')

    // police force
    cy.selectFromAutocomplete('What is the name of the local police force?', recall.localPoliceForceLabel)
    cy.clickButton('Continue')

    // vulnerability / contraband
    cy.selectRadio(
      'Are there any vulnerability issues or diversity needs?',
      booleanToYesNo(recall.vulnerabilityDiversity)
    )
    cy.fillInput('Provide more detail', recall.vulnerabilityDiversityDetail, {
      parent: '#conditional-vulnerabilityDiversity',
    })
    cy.selectRadio(`Do you think ${personName} will bring contraband into prison?`, booleanToYesNo(recall.contraband))
    cy.fillInput('Provide more detail', recall.contrabandDetail, { parent: '#conditional-contraband' })

    cy.selectFromDropdown('MAPPA level', recall.mappaLevelLabel)
    cy.clickButton('Continue')

    // probation officer
    cy.fillInput('Name', recall.probationOfficerName)
    cy.fillInput('Email address', recall.probationOfficerEmail)
    cy.fillInput('Phone number', recall.probationOfficerPhoneNumber)
    cy.selectFromAutocomplete('Local Delivery Unit (LDU)', recall.localDeliveryUnitLabel)
    cy.fillInput('Assistant Chief Officer (ACO) that signed-off the recall', recall.authorisingAssistantChiefOfficer)
    cy.clickButton('Continue')

    // upload documents
    cy.pageHeading('Upload documents')
    cy.clickButton('Continue')

    // missing documents
    cy.uploadEmail({ field: 'missingDocumentsEmailFileName' })
    cy.fillInput('Provide more detail', 'Chased', { clearExistingText: true })
    cy.clickButton('Continue')
    cy.pageHeading().should('equal', 'Check the details before booking this recall')

    cy.clickButton('Complete booking')
    cy.pageHeading().should('equal', `Recall booked for ${personName}`)
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

    checkAnswers.assertElementHasText({ qaAttr: 'inCustody', textToFind: 'Not in custody' })

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
    checkAnswers.assertElementHasText({ qaAttr: 'arrestIssues', textToFind: 'Detail...' })
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

  it('User sees an error if the custody status question is not answered', () => {
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'custody-status' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'inCustody',
      summaryError: 'Is Bobby Badger in custody?',
    })
  })

  it('User sees an error if the licence name question is not answered', () => {
    const recallLicenceName = recallLicenceNamePage.verifyOnPage({ nomsNumber, recallId, personName })
    recallLicenceName.clickContinue()
    recallLicenceName.assertErrorMessage({
      fieldName: 'licenceNameCategory',
      summaryError: "How does Bobby Badger's name appear on the licence?",
    })
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
            documentId: '456',
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
    recallRequestReceived.assertLinkHref({
      qaAttr: 'uploadedDocument-RECALL_REQUEST_EMAIL',
      href: '/persons/A1234AA/recalls/123/documents/456',
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

  it('User sees errors if issues & needs questions not answered', () => {
    cy.task('expectGetRecall', { expectedResult: { ...newRecall, inCustody: false } })
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'issues-needs' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'vulnerabilityDiversity',
      summaryError: 'Are there any vulnerability issues or diversity needs?',
    })
    cy.assertErrorMessage({
      fieldName: 'contraband',
      summaryError: `Do you think ${personName} will bring contraband into prison?`,
    })
    cy.assertErrorMessage({
      fieldName: 'arrestIssues',
      summaryError: 'Are there any arrest issues?',
    })
    cy.assertErrorMessage({
      fieldName: 'mappaLevel',
      summaryError: 'Select a MAPPA level',
    })
  })

  it('User sees errors if issues & needs detail not provided', () => {
    cy.task('expectGetRecall', { expectedResult: { ...newRecall, inCustody: false } })
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'issues-needs' })
    cy.selectRadio('Are there any vulnerability issues or diversity needs?', 'Yes')
    cy.selectRadio('Do you think Bobby Badger will bring contraband into prison?', 'Yes')
    cy.selectRadio('Are there any arrest issues?', 'Yes')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'vulnerabilityDiversityDetail',
      summaryError: 'Provide more detail for any vulnerability issues or diversity needs',
    })
    cy.assertErrorMessage({
      fieldName: 'arrestIssuesDetail',
      summaryError: 'Provide more detail for any arrest issues',
    })
    cy.assertErrorMessage({
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
