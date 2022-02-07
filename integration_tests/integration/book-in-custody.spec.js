import { getEmptyRecallResponse, getRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'
import recallLastReleasePage from '../pages/recallSentenceDetails'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import recallLicenceNamePage from '../pages/recallLicenceName'
import { booleanToYesNo } from '../support/utils'
import { stubRefData } from '../support/mock-api'

const recallPreConsNamePage = require('../pages/recallPreConsName')
const recallRequestReceivedPage = require('../pages/recallRequestReceived')
const recallPrisonPolicePage = require('../pages/recallPrisonPolice')
const recallProbationOfficerPage = require('../pages/recallProbationOfficer')
const { recall } = require('../fixtures')

context('Book an "in-custody" recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getRecallResponse.firstName} ${getRecallResponse.lastName}`
  const newRecall = { ...getEmptyRecallResponse, recallId, status: 'BEING_BOOKED_ON' }

  beforeEach(() => {
    cy.login()
  })

  it('book a recall', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.task('expectUpdateRecall', { recallId })
    cy.task('expectUploadRecallDocument', { statusCode: 201 })
    cy.task('expectAddMissingDocumentsRecord', { statusCode: 201 })
    cy.task('expectSetDocumentCategory')
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    stubRefData()
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

  it('check their answers', () => {
    // eslint-disable-next-line no-unused-vars
    const [licence, ...documents] = [...getRecallResponse.documents]
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        documents,
        status: RecallResponse.status.BEING_BOOKED_ON,
        inCustodyAtBooking: true,
      },
    })
    stubRefData()
    const checkAnswers = checkAnswersPage.verifyOnPage({ recallId, nomsNumber })
    checkAnswers.assertElementHasText({ qaAttr: 'name', textToFind: 'Bobby Badger' })
    checkAnswers.assertElementHasText({ qaAttr: 'dateOfBirth', textToFind: '28 May 1999' })
    checkAnswers.assertElementHasText({ qaAttr: 'nomsNumber', textToFind: nomsNumber })
    checkAnswers.assertElementHasText({ qaAttr: 'croNumber', textToFind: '1234/56A' })
    checkAnswers.assertElementHasText({ qaAttr: 'previousConvictionMainName', textToFind: 'Walter Holt' })

    checkAnswers.assertElementHasText({ qaAttr: 'inCustodyAtBooking', textToFind: 'In custody' })

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

  it('error - the custody status question is not answered', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getEmptyRecallResponse,
      },
    })
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'custody-status' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'inCustodyAtBooking',
      summaryError: 'Is Bobby Badger in custody?',
    })
  })

  it('errors - address details are not entered or are invalid', () => {
    cy.visit(`/persons/${nomsNumber}/recalls/${recallId}/address-manual`)
    cy.fillInput('Postcode', '1234')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'line1',
      summaryError: 'Enter an address line 1',
    })
    cy.assertErrorMessage({
      fieldName: 'town',
      summaryError: 'Enter a town or city',
    })
    cy.assertErrorMessage({
      fieldName: 'postcode',
      summaryError: 'Enter a postcode in the correct format, like SW1H 9AJ',
    })
  })

  it('error - the licence name question is not answered', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getEmptyRecallResponse,
      },
    })
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

  it('pre-cons - errors, detail', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.visitRecallPage({ recallId, nomsNumber, pageSuffix: 'pre-cons-name' })
    cy.clickButton('Continue')
    const heading = `How does ${personName}'s name appear on the previous convictions sheet (pre-cons)?`
    cy.assertErrorMessage({
      fieldName: 'previousConvictionMainNameCategory',
      summaryError: heading,
    })
    // other name not supplied
    cy.selectRadio(heading, 'Other name')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'previousConvictionMainName',
      summaryError: 'Enter the full name on the pre-cons',
    })
    // first + last selected, and previously Other was selected
    cy.task('expectGetRecall', {
      expectedResult: {
        ...newRecall,
        previousConvictionMainNameCategory: 'OTHER',
        previousConvictionMainName: 'Walter Holt',
      },
    })
    cy.reload()
    cy.selectRadio(heading, personName)
    cy.clickButton('Continue')
    cy.assertRecallFieldsSavedToApi({
      recallId,
      bodyValues: {
        previousConvictionMainNameCategory: 'FIRST_LAST',
        previousConvictionMainName: '',
      },
    })
  })

  it('errors - email request received', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
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
    // recall email is not uploaded'
    recallRequestReceived.assertErrorMessage({
      fieldName: 'recallRequestEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('sees a previously saved recall request email', () => {
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

  it('errors - sentence, offence and release details', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
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
    // invalid booking number is entered
    recallLastRelease.setBookingNumber('12343')
    recallLastRelease.clickContinue()
    recallLastRelease.assertErrorMessage({
      fieldName: 'bookingNumber',
      summaryError: 'Enter a booking number in the correct format, like 12345C, A12347 or AB1234',
    })

    // invalid inputs for sentencing court or releasing prison
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

  it('errors - Local Police Force', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    const recallPrisonPolice = recallPrisonPolicePage.verifyOnPage({ nomsNumber, recallId })
    recallPrisonPolice.clickContinue()
    recallPrisonPolice.assertErrorMessage({
      fieldName: 'localPoliceForceId',
      summaryError: 'Select a local police force',
    })
    // invalid Local Police Force is entered
    recallPrisonPolice.enterLocalPoliceForceId('foobar')
    recallPrisonPolice.clickContinue()
    recallPrisonPolice.assertSelectValue({ fieldName: 'localPoliceForceIdInput', value: 'foobar' })
    recallPrisonPolice.assertErrorMessage({
      fieldName: 'localPoliceForceId',
      summaryError: 'Select a local police force from the list',
    })
  })

  it('errors - issues & needs questions not answered', () => {
    cy.task('expectGetRecall', { expectedResult: { ...newRecall, inCustodyAtBooking: false } })
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

  it('issues & needs detail', () => {
    stubRefData()
    cy.task('expectGetRecall', { expectedResult: { ...newRecall, inCustodyAtBooking: false } })
    cy.task('expectUpdateRecall', { recallId })
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'issues-needs' })
    // errors if detail not provided
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
    // reset detail to empty string if user selects No, and there is existing detail
    cy.task('expectGetRecall', {
      expectedResult: {
        ...newRecall,
        inCustodyAtBooking: false,
        contraband: true,
        contrabandDetail: 'Detail',
        vulnerabilityDiversity: true,
        vulnerabilityDiversityDetail: 'Detail',
        arrestIssues: true,
        arrestIssuesDetail: 'Detail',
      },
    })
    cy.reload()
    cy.selectRadio('Are there any vulnerability issues or diversity needs?', 'No')
    cy.selectRadio('Do you think Bobby Badger will bring contraband into prison?', 'No')
    cy.selectRadio('Are there any arrest issues?', 'No')
    cy.selectFromDropdown('MAPPA level', recall.mappaLevelLabel)
    cy.clickButton('Continue')
    cy.assertRecallFieldsSavedToApi({
      recallId,
      bodyValues: {
        contraband: false,
        contrabandDetail: '',
        vulnerabilityDiversity: false,
        vulnerabilityDiversityDetail: '',
        arrestIssues: false,
        arrestIssuesDetail: '',
      },
    })
  })

  it('errors - probation details', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
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
    // invalid probation officer email and phone are entered
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
    // invalid input for local delivery unit
    cy.get('[id="localDeliveryUnit"]').clear().type('blah blah blah')
    recallProbationOfficer.clickContinue()
    recallProbationOfficer.assertSelectValue({ fieldName: 'localDeliveryUnitInput', value: 'blah blah blah' })
    recallProbationOfficer.assertErrorMessage({
      fieldName: 'localDeliveryUnit',
      summaryError: 'Select a Local Delivery Unit from the list',
    })
  })

  it('can check and change their answers then navigate back to the check answers page', () => {
    cy.task('expectGetRecall', {
      expectedResult: { recallId, ...getRecallResponse, status: RecallResponse.status.BEING_BOOKED_ON },
    })
    const checkAnswers = checkAnswersPage.verifyOnPage({ nomsNumber, recallId })
    checkAnswers.checkChangeLinks()
    checkAnswers.clickElement({ qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT-Change' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.clickElement({ qaAttr: 'backLinkUploadDocuments' })
    checkAnswersPage.verifyOnPage()
  })
})
