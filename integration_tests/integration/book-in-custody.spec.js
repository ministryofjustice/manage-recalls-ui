import { getEmptyRecallResponse, getPrisonerResponse, getRecallResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import { booleanToYesNo } from '../support/utils'
import { stubRefData } from '../support/mock-api'

const { recall } = require('../fixtures')

context('Book an "in-custody" recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'
  const personName = `${getRecallResponse.firstName} ${getRecallResponse.lastName}`
  const newRecall = { ...getEmptyRecallResponse, recallId, status: 'BEING_BOOKED_ON' }

  beforeEach(() => {
    cy.login()
  })

  it('book an "in custody" recall', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...newRecall,
        missingDocuments: { required: ['PART_A_RECALL_REPORT'], desired: [] },
      },
    })
    cy.task('expectUpdateRecall', { recallId })
    cy.task('expectUploadRecallDocument')
    cy.task('expectAddMissingDocumentsRecord')
    cy.task('expectSetDocumentCategory')
    cy.task('expectSetRecommendedRecallType')
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.task('expectCreateRecall', { expectedResults: { recallId } })
    stubRefData()
    cy.visit(`/find-person?nomsNumber=${nomsNumber}`)
    cy.clickButton('Book a recall')

    // licence name
    const personNameWithMiddleNames = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.middleNames} ${getEmptyRecallResponse.lastName}`
    cy.getRadioOptionByLabel(`How does ${personName}'s name appear on the licence?`, personNameWithMiddleNames).should(
      'exist'
    )
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

    // recall type - fixed or standard
    cy.selectRadio('What type of recall is being recommended?', 'Fixed term')
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
    cy.pageHeading().should('equal', 'Upload documents')
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
        returnedToCustodyDateTime: undefined,
        recommendedRecallType: 'FIXED',
        missingDocuments: { required: ['LICENCE'], desired: [] },
      },
    })
    stubRefData()
    cy.visitRecallPage({ recallId, pageSuffix: 'check-answers' })
    cy.getText('name').should('equal', 'Bobby Badger')
    cy.getText('dateOfBirth').should('equal', '28 May 1999')
    cy.getText('nomsNumber').should('equal', nomsNumber)
    cy.getText('croNumber').should('equal', '1234/56A')
    cy.getText('previousConvictionMainName').should('equal', 'Walter Holt')

    cy.getText('inCustodyAtBooking').should('equal', 'In custody')

    // Recall details
    cy.recallInfo('Recall type').should('equal', 'Fixed term')
    cy.recallInfo('Recall length').should('equal', '14 days')
    cy.getText('recallEmailReceivedDateTime').should('equal', '5 December 2020 at 15:33')

    // Sentence, offence and release details
    cy.getText('sentenceType').should('equal', 'Determinate')
    cy.getText('sentenceDate').should('equal', '3 August 2019')
    cy.getText('licenceExpiryDate').should('equal', '3 August 2021')
    cy.getText('sentenceExpiryDate').should('equal', '3 February 2021')
    cy.getText('sentenceLength').should('equal', '2 years 3 months')
    cy.getText('sentencingCourt').should('equal', 'Aberdare County Court')
    cy.getText('indexOffence').should('equal', 'Burglary')
    cy.getText('lastReleasePrison').should('equal', 'Kennet (HMP)')
    cy.getText('bookingNumber').should('equal', 'A123456')
    cy.getText('lastReleaseDate').should('equal', '3 August 2020')
    cy.getText('conditionalReleaseDate').should('equal', '3 December 2021')
    // local police force
    cy.getText('localPoliceForce').should('equal', 'Devon & Cornwall Police')
    // issues or needs
    cy.getText('vulnerabilityDiversity').should('equal', 'Various...')
    cy.getText('contraband').should('equal', 'Intention to smuggle drugs')
    cy.getText('mappaLevel').should('equal', 'Level 1')
    // probation details
    cy.getText('probationOfficerName').should('equal', 'Dave Angel')
    cy.getText('probationOfficerEmail').should('equal', 'probation.office@justice.com')
    cy.getText('probationOfficerPhoneNumber').should('equal', '07473739388')
    cy.getText('localDeliveryUnit').should('equal', 'Central Audit Team')
    cy.getText('authorisingAssistantChiefOfficer').should('equal', 'Bob Monkfish')

    // uploaded documents
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT').should('equal', 'Part A.pdf')
    cy.getText('uploadedDocument-PREVIOUS_CONVICTIONS_SHEET').should('equal', 'Pre Cons.pdf')
    cy.getText('uploadedDocument-PRE_SENTENCING_REPORT').should('equal', 'PSR.pdf')

    // missing documents
    cy.getText('required-LICENCE').should('equal', 'Missing: needed to create dossier')
  })

  it('error - the custody status question is not answered', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getEmptyRecallResponse,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'custody-status' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'inCustodyAtBooking',
      summaryError: 'Is Bobby Badger in custody?',
    })
  })

  it('error - recall type question is not answered', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getEmptyRecallResponse,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'recall-type' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'recommendedRecallType',
      summaryError: 'What type of recall is being recommended?',
    })
  })

  it('errors - address details are not entered or are invalid', () => {
    cy.visitRecallPage({ recallId, pageSuffix: 'address-manual' })
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
    cy.visitRecallPage({ recallId, pageSuffix: 'licence-name' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'licenceNameCategory',
      summaryError: "How does Bobby Badger's name appear on the licence?",
    })
  })

  it("User doesn't see a middle name option for pre-cons name if the person doesn't have one", () => {
    cy.task('expectGetRecall', {
      expectedResult: { recallId, ...getRecallResponse, middleNames: '' },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'pre-cons-name' })
    cy.getElement('Bobby John Badger').should('not.exist')
  })

  it('pre-cons - errors, detail', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.visitRecallPage({ recallId, pageSuffix: 'pre-cons-name' })
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

  it('licence name radio is selected if populated', () => {
    cy.task('expectGetRecall', { expectedResult: { ...newRecall, licenceNameCategory: 'FIRST_LAST' } })
    cy.visitRecallPage({ recallId, pageSuffix: 'licence-name' })
    cy.getRadioOptionByLabel(`How does ${personName}'s name appear on the licence?`, `${personName}`).should(
      'be.checked'
    )
  })

  it('errors - email request received', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.visitRecallPage({ recallId, pageSuffix: 'request-received' })
    cy.clickButton('Set date to today')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldId: 'recallEmailReceivedDateTime-recallEmailReceivedDateTimeDay',
      fieldName: 'recallEmailReceivedDateTime',
      summaryError: 'Enter the time you received the recall email',
    })
    // recall email is not uploaded'
    cy.assertErrorMessage({
      fieldName: 'recallRequestEmailFileName',
      summaryError: 'Select an email',
    })
  })

  it('sees a previously saved recall request email', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        nomsNumber,
        documents: [
          {
            documentId: '456',
            category: 'RECALL_REQUEST_EMAIL',
            fileName: 'email.msg',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'request-received' })
    cy.getText('uploadedDocument-RECALL_REQUEST_EMAIL').should('equal', 'email.msg')
    cy.getLinkHref({
      qaAttr: 'uploadedDocument-RECALL_REQUEST_EMAIL',
    }).should('contain', '/recalls/123/documents/456')
  })

  it('errors - sentence, offence and release details', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.visitRecallPage({ recallId, pageSuffix: 'last-release' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldId: 'lastReleaseDate-lastReleaseDateDay',
      fieldName: 'lastReleaseDate',
      summaryError: 'Enter the latest release date',
    })
    cy.assertErrorMessage({
      fieldName: 'lastReleasePrison',
      summaryError: 'Select a releasing prison',
    })
    cy.assertErrorMessage({
      fieldName: 'sentencingCourt',
      summaryError: 'Select a sentencing court',
    })
    cy.assertErrorMessage({
      fieldId: 'sentenceDate-sentenceDateDay',
      fieldName: 'sentenceDate',
      summaryError: 'Enter the date of sentence',
    })
    cy.assertErrorMessage({
      fieldId: 'sentenceExpiryDate-sentenceExpiryDateDay',
      fieldName: 'sentenceExpiryDate',
      summaryError: 'Enter the sentence expiry date',
    })
    cy.assertErrorMessage({
      fieldId: 'licenceExpiryDate-licenceExpiryDateDay',
      fieldName: 'licenceExpiryDate',
      summaryError: 'Enter the licence expiry date',
    })
    cy.assertErrorMessage({
      fieldId: 'sentenceLength-sentenceLengthYears',
      fieldName: 'sentenceLength',
      summaryError: 'Enter the length of sentence',
    })
    cy.assertErrorMessage({
      fieldName: 'bookingNumber',
      summaryError: 'Enter a booking number',
    })
    // invalid booking number is entered
    cy.fillInput('Booking number', '12343')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'bookingNumber',
      summaryError: 'Enter a booking number in the correct format, like 12345C, A12347 or AB1234',
    })

    // invalid inputs for sentencing court or releasing prison
    cy.get('[id="sentencingCourt"]').clear().type('blah blah blah')
    cy.get('[id="lastReleasePrison"]').clear().type('piffle')
    cy.clickButton('Continue')
    cy.getFormFieldByLabel('Sentencing court').should('have.value', 'blah blah blah')
    cy.assertErrorMessage({
      fieldName: 'sentencingCourt',
      summaryError: 'Select a sentencing court from the list',
    })
    cy.getFormFieldByLabel('Releasing prison').should('have.value', 'piffle')
    cy.assertErrorMessage({
      fieldName: 'lastReleasePrison',
      summaryError: 'Select a releasing prison from the list',
    })
  })

  it('errors - Local Police Force', () => {
    cy.task('expectGetRecall', { expectedResult: newRecall })
    cy.visitRecallPage({ recallId, pageSuffix: 'prison-police' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'localPoliceForceId',
      summaryError: 'Select a local police force',
    })
    // invalid Local Police Force is entered
    cy.fillInput('What is the name of the local police force?', 'foo')
    cy.clickButton('Continue')
    cy.getFormFieldByLabel('What is the name of the local police force?').should('have.value', 'foo')
    cy.assertErrorMessage({
      fieldName: 'localPoliceForceId',
      summaryError: 'Select a local police force from the list',
    })
  })

  it('errors - issues & needs questions not answered', () => {
    cy.task('expectGetRecall', { expectedResult: { ...newRecall, inCustodyAtBooking: false } })
    cy.visitRecallPage({ recallId, pageSuffix: 'issues-needs' })
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
    cy.visitRecallPage({ recallId, pageSuffix: 'issues-needs' })
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
    cy.visitRecallPage({ recallId, pageSuffix: 'probation-officer' })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'probationOfficerName',
      summaryError: 'Enter a name',
    })
    cy.assertErrorMessage({
      fieldName: 'probationOfficerEmail',
      summaryError: 'Enter an email',
    })
    cy.assertErrorMessage({
      fieldName: 'probationOfficerPhoneNumber',
      summaryError: 'Enter a phone number',
    })
    cy.assertErrorMessage({
      fieldName: 'localDeliveryUnit',
      summaryError: 'Select a Local Delivery Unit',
    })
    cy.assertErrorMessage({
      fieldName: 'authorisingAssistantChiefOfficer',
      summaryError: 'Enter the Assistant Chief Officer that signed-off the recall',
    })
    // invalid probation officer email and phone are entered
    cy.fillInput('Email', 'invalid@email')
    cy.fillInput('Phone number', '12343')
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'probationOfficerEmail',
      summaryError: 'Enter an email address in the correct format, like name@example.com',
    })
    cy.assertErrorMessage({
      fieldName: 'probationOfficerPhoneNumber',
      summaryError: 'Enter a phone number in the correct format, like 01277 960901',
    })
    // invalid input for local delivery unit
    cy.fillInput('Local Delivery Unit (LDU)', 'blah blah blah')
    cy.clickButton('Continue')
    cy.getFormFieldByLabel('Local Delivery Unit (LDU)').should('have.value', 'blah blah blah')
    cy.assertErrorMessage({
      fieldName: 'localDeliveryUnit',
      summaryError: 'Select a Local Delivery Unit from the list',
    })
  })

  it('can check and change their answers then navigate back to the check answers page', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.BEING_BOOKED_ON,
        returnedToCustodyDateTime: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'check-answers' })
    cy.getText('name').should('equal', 'Bobby Badger')
    const checkLink = (qaAttr, href) => cy.get(`[data-qa=${qaAttr}]`).should('have.attr', 'href').and('include', href)
    cy.getLinkHref('Change licence name').should(
      'contain',
      '/licence-name?fromPage=check-answers&fromHash=personalDetails'
    )
    cy.getLinkHref('Change custody status at booking').should(
      'contain',
      '/custody-status?fromPage=check-answers&fromHash=custody'
    )
    checkLink('previousConvictionMainNameChange', '/pre-cons-name?fromPage=check-answers&fromHash=personalDetails')
    cy.getLinkHref('Change recall type').should('contain', '/recall-type?fromPage=check-answers&fromHash=recallDetails')
    checkLink('recallEmailReceivedDateTimeChange', '/request-received?fromPage=check-answers&fromHash=recallDetails')
    checkLink('recallRequestEmailFileNameChange', '/request-received?fromPage=check-answers&fromHash=recallDetails')
    checkLink('sentenceDateChange', '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceDateGroup')
    checkLink(
      'licenceExpiryDateChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#licenceExpiryDateGroup'
    )
    checkLink(
      'sentenceExpiryDateChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceExpiryDateGroup'
    )
    checkLink(
      'sentenceLengthChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceLengthGroup'
    )
    checkLink(
      'sentencingCourtChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentencingCourtGroup'
    )
    checkLink('indexOffenceChange', '/last-release?fromPage=check-answers&fromHash=sentenceDetails#indexOffenceGroup')
    checkLink(
      'lastReleasePrisonChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#lastReleasePrisonGroup'
    )
    checkLink('bookingNumberChange', '/last-release?fromPage=check-answers&fromHash=sentenceDetails#bookingNumberGroup')
    checkLink(
      'lastReleaseDateChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#lastReleaseDateGroup'
    )
    checkLink(
      'conditionalReleaseDateChange',
      '/last-release?fromPage=check-answers&fromHash=sentenceDetails#conditionalReleaseDateGroup'
    )
    checkLink('localPoliceForceChange', '/prison-police?fromPage=check-answers&fromHash=police')
    checkLink(
      'vulnerabilityDiversityChange',
      '/issues-needs?fromPage=check-answers&fromHash=issues#vulnerabilityDiversityGroup'
    )
    checkLink('contrabandChange', '/issues-needs?fromPage=check-answers&fromHash=issues#contrabandGroup')
    checkLink('arrestIssuesChange', '/issues-needs?fromPage=check-answers&fromHash=issues#arrestIssuesGroup')
    checkLink('mappaLevelChange', '/issues-needs?fromPage=check-answers&fromHash=issues#mappaLevelGroup')
    checkLink(
      'probationOfficerChange',
      '/probation-officer?fromPage=check-answers&fromHash=probation#probationOfficerGroup'
    )
    checkLink(
      'localDeliveryUnitChange',
      '/probation-officer?fromPage=check-answers&fromHash=probation#localDeliveryUnitGroup'
    )
    checkLink(
      'authorisingAssistantChiefOfficerChange',
      '/probation-officer?fromPage=check-answers&fromHash=probation#authorisingAssistantChiefOfficerGroup'
    )
    checkLink(
      'uploadedDocument-PART_A_RECALL_REPORT-Change',
      '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
    )
    checkLink('uploadedDocument-LICENCE-Change', '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents')
    checkLink(
      'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET-Change',
      '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
    )
    checkLink(
      'uploadedDocument-PRE_SENTENCING_REPORT-Change',
      '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
    )
    cy.clickLink('Change Part A recall report')
    cy.clickLink('Back')
    cy.pageHeading().should('equal', 'Check the details before booking this recall')
  })
})
