import { getFormValues } from './getFormValues'
import { FormError, ObjectMap, DecoratedRecall } from '../../@types'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../@types/manage-recalls-api/models/RecallDocument'
import updateRecallResponse from '../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { decorateDocs } from '../documents/download/helpers/decorateDocs'
import { MissingDocumentsRecord } from '../../@types/manage-recalls-api/models/MissingDocumentsRecord'

describe('getFormValues', () => {
  const errors = {
    inCustodyAtBooking: {
      text: 'Custody status',
    },
    inCustodyAtAssessment: {
      text: 'Custody status',
    },
    agreeWithRecall: {
      text: 'Decision on recall',
    },
    agreeWithRecallDetailYes: {
      text: 'Provide more detail',
    },
    recommendedRecallType: {
      text: 'Type of recall',
    },
    recallEmailReceivedDateTime: { values: { year: '', month: '12', day: '05', hour: '15', minute: '33' } },
    lastReleasePrison: {
      text: 'Releasing prison',
    },
    sentenceDate: { values: { year: '2020', month: '', day: '05' } },
    sentenceExpiryDate: { values: { year: '', month: '', day: '' } },
    licenceExpiryDate: { values: { year: '', month: '', day: '05' } },
    conditionalReleaseDate: { values: { year: '', month: '12', day: '05' } },
    lastReleaseDate: { values: { year: 'www', month: 'rr', day: 'ee' } },
    localPoliceForceId: {
      text: 'Local police force',
    },
    sentencingCourt: {
      text: 'Sentencing court',
    },
    indexOffence: {
      text: 'Index offence',
    },
    contraband: {
      text: 'Contraband',
    },
    contrabandDetail: {
      text: 'Contraband detail',
    },
    vulnerabilityDiversity: {
      text: 'Vulnerability',
    },
    vulnerabilityDiversityDetail: {
      text: 'Vulnerability detail',
    },
    arrestIssues: {
      text: 'Arrest issues',
    },
    arrestIssuesDetail: {
      text: 'Vulnerability detail',
    },
    mappaLevel: {
      text: 'MAPPA level',
    },
    sentenceLength: {
      values: {
        days: '',
        months: 'rr',
        years: '',
      },
    },
    bookingNumber: {
      text: 'Booking number',
    },
    probationOfficerName: {
      text: 'Probation officer',
    },
    probationOfficerPhoneNumber: {
      text: 'Phone',
      values: '999',
    },
    probationOfficerEmail: {
      text: 'Email',
      values: 'invalid@email',
    },
    localDeliveryUnit: {
      text: 'Local Delivery Unit',
    },
    authorisingAssistantChiefOfficer: {
      text: 'ACO',
    },
    licenceConditionsBreached: {
      text: 'Breached licence conditions',
    },
    reasonsForRecall: {
      text: 'Reasons for recall',
    },
    reasonsForRecallOtherDetail: {
      text: 'Other detail',
    },
    currentPrison: {
      text: 'Current prison',
    },
    recallNotificationEmailFileName: {
      text: 'An error occurred uploading the email',
      values: 'email.msg',
    },
    dossierEmailFileName: {
      text: 'An error occurred uploading the email',
      values: 'dossier.msg',
    },
    rescindRequestDetail: {
      text: 'Rescind request detail',
    },
    recallNotificationEmailSentDateTime: { values: { year: '', month: '', day: '05', hour: '05', minute: '3' } },
    rescindRequestEmailReceivedDate: { values: { year: '', month: '43', day: '' } },
    dossierEmailSentDate: { values: { year: '2016', month: '', day: '13' } },
    confirmRecallNotificationEmailSent: { text: 'Recall notification email sent' },
    confirmDossierEmailSent: { text: 'Dossier email sent' },
    previousConvictionMainNameCategory: { text: 'What is the main name on the pre-cons?' },
    previousConvictionMainName: { text: 'What is the other main name used?' },
    hasDossierBeenChecked: { text: 'Has the dossier been checked for accuracy?' },
    warrantReferenceNumber: { text: 'Warrant reference number' },
    returnedToCustodyDateTime: { values: { year: '', month: '', day: '05', hour: '05', minute: '3' } },
    returnedToCustodyNotificationDateTime: { values: { year: '', month: '', day: '05', hour: '05', minute: '3' } },
  } as unknown as ObjectMap<FormError>

  const unsavedValues = {
    inCustodyAtBooking: 'NO',
    inCustodyAtAssessment: 'YES',
    agreeWithRecall: 'NO',
    agreeWithRecallDetail: 'Reasons for no...',
    recommendedRecallType: 'STANDARD',
    recallEmailReceivedDateTimeParts: { year: '2020', month: '12', day: '05', hour: '15', minute: '33' },
    sentenceDateParts: { year: '2020', month: '12', day: '05' },
    sentenceExpiryDateParts: { year: '2020', month: '12', day: '05' },
    licenceExpiryDateParts: { year: '2020', month: '12', day: '05' },
    lastReleaseDateParts: { year: '2020', month: '12', day: '05' },
    conditionalReleaseDateParts: { year: '2020', month: '12', day: '05' },
    sentenceLengthParts: {
      days: '',
      months: '3',
      years: '',
    },
    lastReleasePrison: 'Portland',
    localPoliceForceId: 'dyfed-powys',
    sentencingCourt: 'Dorchester',
    indexOffence: 'Assault',
    contraband: 'YES',
    contrabandDetail: 'Likelihood of smuggling knives',
    vulnerabilityDiversity: 'NO',
    vulnerabilityDiversityDetail: '',
    arrestIssues: 'YES',
    arrestIssuesDetail: 'Detail..',
    mappaLevel: 'LEVEL_2',
    bookingNumber: '87378435D',
    probationOfficerName: 'Andy Fleming',
    probationOfficerPhoneNumber: '0739738383',
    probationOfficerEmail: 'andy@probation.gov.uk',
    localDeliveryUnit: 'ISLE_OF_MAN',
    authorisingAssistantChiefOfficer: 'Carrie Grant',
    licenceConditionsBreached: '(iii) three \n (iv) four',
    reasonsForRecall: ['POOR_BEHAVIOUR_NON_COMPLIANCE'],
    reasonsForRecallOtherDetail: '',
    currentPrison: 'ACL',
    recallNotificationEmailFileName: 'recall.msg',
    recallNotificationEmailSentDateTimeParts: { year: '2019', month: '04', day: '23', hour: '6', minute: '34' },
    rescindRequestEmailReceivedDateParts: { year: '2019', month: '04', day: '23', hour: '6', minute: '34' },
    dossierEmailFileName: 'dossier.msg',
    dossierEmailSentDateParts: { year: '2020', month: '11', day: '17' },
    confirmRecallNotificationEmailSent: 'YES',
    confirmDossierEmailSent: 'YES',
    previousConvictionMainNameCategory: 'FIRST_LAST',
    previousConvictionMainName: 'Wayne Holt',
    hasDossierBeenChecked: 'YES',
    rescindRequestDetail: 'Detail...',
    warrantReferenceNumber: '02RC/1234567C12345',
    returnedToCustodyDateTimeParts: { values: { year: '2021', month: '12', day: '05', hour: '05', minute: '3' } },
    returnedToCustodyNotificationDateTimeParts: {
      values: { year: '2021', month: '12', day: '05', hour: '05', minute: '2' },
    },
  }

  const apiValues = {
    ...updateRecallResponse,
    ...decorateDocs({
      docs: updateRecallResponse.documents as RecallDocument[],
      recall: {
        nomsNumber: '123',
        recallId: '456',
        bookingNumber: updateRecallResponse.bookingNumber,
        firstName: 'Bobby',
        lastName: 'Badger',
        missingDocumentsRecords: updateRecallResponse.missingDocumentsRecords as MissingDocumentsRecord[],
      } as RecallResponse,
    }),
    enableDeleteDocuments: false,
  }
  it('uses errors if no unsaved or API values', () => {
    const formValues = getFormValues({ errors, unsavedValues: {}, apiValues: {} as DecoratedRecall })
    expect(formValues).toEqual({
      agreeWithRecall: '',
      arrestIssues: '',
      arrestIssuesDetail: '',
      authorisingAssistantChiefOfficer: '',
      bookingNumber: '',
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '',
      },
      confirmDossierEmailSent: '',
      confirmRecallNotificationEmailSent: '',
      contraband: '',
      contrabandDetail: '',
      currentPrison: '',
      dossierEmailFileName: 'dossier.msg',
      dossierEmailSentDateParts: {
        day: '13',
        month: '',
        year: '2016',
      },
      inCustodyAtBooking: '',
      inCustodyAtAssessment: '',
      hasDossierBeenChecked: '',
      previousConvictionMainNameCategory: '',
      indexOffence: '',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: '',
      licenceConditionsBreached: '',
      licenceExpiryDateParts: {
        day: '05',
        month: '',
        year: '',
      },
      localPoliceForceId: '',
      mappaLevel: '',
      previousConvictionMainName: '',
      localDeliveryUnit: '',
      probationOfficerEmail: 'invalid@email',
      probationOfficerName: '',
      probationOfficerPhoneNumber: '999',
      reasonsForRecall: '',
      reasonsForRecallOtherDetail: '',
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '',
      },
      recallNotificationEmailFileName: 'email.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: '05',
        hour: '05',
        minute: '3',
        month: '',
        year: '',
      },
      recommendedRecallType: '',
      rescindRequestDetail: '',
      rescindRequestEmailReceivedDateParts: {
        day: '',
        month: '43',
        year: '',
      },
      returnedToCustodyDateTimeParts: {
        day: '05',
        hour: '05',
        minute: '3',
        month: '',
        year: '',
      },
      returnedToCustodyNotificationDateTimeParts: {
        day: '05',
        hour: '05',
        minute: '3',
        month: '',
        year: '',
      },
      sentenceDateParts: {
        day: '05',
        month: '',
        year: '2020',
      },
      sentenceExpiryDateParts: {
        day: '',
        month: '',
        year: '',
      },
      sentenceLengthParts: {
        days: '',
        months: 'rr',
        years: '',
      },
      sentencingCourt: '',
      vulnerabilityDiversity: '',
      vulnerabilityDiversityDetail: '',
      warrantReferenceNumber: '',
    })
  })

  it('uses unsaved values if there is one error value but no API values', () => {
    const formValues = getFormValues({
      errors: { lastReleaseDate: errors.lastReleaseDate },
      unsavedValues,
      apiValues: {} as DecoratedRecall,
    })
    expect(formValues).toEqual({
      agreeWithRecall: 'NO',
      arrestIssues: 'YES',
      arrestIssuesDetail: 'Detail..',
      authorisingAssistantChiefOfficer: 'Carrie Grant',
      bookingNumber: '87378435D',
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      confirmDossierEmailSent: 'YES',
      confirmRecallNotificationEmailSent: 'YES',
      contraband: 'YES',
      contrabandDetail: 'Likelihood of smuggling knives',
      currentPrison: 'ACL',
      dossierEmailFileName: 'dossier.msg',
      dossierEmailSentDateParts: {
        day: '17',
        month: '11',
        year: '2020',
      },
      hasDossierBeenChecked: 'YES',
      inCustodyAtBooking: 'NO',
      inCustodyAtAssessment: 'YES',
      indexOffence: 'Assault',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: 'Portland',
      licenceConditionsBreached: '(iii) three \n (iv) four',
      licenceExpiryDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      localPoliceForceId: 'dyfed-powys',
      mappaLevel: 'LEVEL_2',
      previousConvictionMainName: 'Wayne Holt',
      previousConvictionMainNameCategory: 'FIRST_LAST',
      localDeliveryUnit: 'ISLE_OF_MAN',
      probationOfficerEmail: 'andy@probation.gov.uk',
      probationOfficerName: 'Andy Fleming',
      probationOfficerPhoneNumber: '0739738383',
      reasonsForRecall: ['POOR_BEHAVIOUR_NON_COMPLIANCE'],
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '2020',
      },
      recallNotificationEmailFileName: 'recall.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: '23',
        hour: '6',
        minute: '34',
        month: '04',
        year: '2019',
      },
      recommendedRecallType: 'STANDARD',
      rescindRequestDetail: 'Detail...',
      rescindRequestEmailReceivedDateParts: {
        day: '23',
        hour: '6',
        minute: '34',
        month: '04',
        year: '2019',
      },
      returnedToCustodyDateTimeParts: {
        values: {
          day: '05',
          hour: '05',
          minute: '3',
          month: '12',
          year: '2021',
        },
      },
      returnedToCustodyNotificationDateTimeParts: {
        values: {
          day: '05',
          hour: '05',
          minute: '2',
          month: '12',
          year: '2021',
        },
      },
      sentenceDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      sentenceExpiryDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      sentenceLengthParts: {
        days: '',
        months: '3',
        years: '',
      },
      sentencingCourt: 'Dorchester',
      vulnerabilityDiversity: 'NO',
      warrantReferenceNumber: '02RC/1234567C12345',
    })
  })

  it('uses all error values over unsaved values', () => {
    const formValues = getFormValues({ errors, unsavedValues, apiValues: {} as DecoratedRecall })
    expect(formValues).toEqual({
      agreeWithRecall: '',
      arrestIssues: '',
      arrestIssuesDetail: '',
      authorisingAssistantChiefOfficer: '',
      bookingNumber: '',
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '',
      },
      confirmDossierEmailSent: '',
      confirmRecallNotificationEmailSent: '',
      contraband: '',
      contrabandDetail: '',
      currentPrison: '',
      dossierEmailFileName: 'dossier.msg',
      dossierEmailSentDateParts: {
        day: '13',
        month: '',
        year: '2016',
      },
      hasDossierBeenChecked: '',
      previousConvictionMainNameCategory: '',
      inCustodyAtBooking: '',
      inCustodyAtAssessment: '',
      indexOffence: '',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: '',
      licenceConditionsBreached: '',
      licenceExpiryDateParts: {
        day: '05',
        month: '',
        year: '',
      },
      localPoliceForceId: '',
      mappaLevel: '',
      previousConvictionMainName: '',
      localDeliveryUnit: '',
      probationOfficerEmail: 'invalid@email',
      probationOfficerName: '',
      probationOfficerPhoneNumber: '999',
      reasonsForRecall: '',
      reasonsForRecallOtherDetail: '',
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '',
      },
      recallNotificationEmailFileName: 'email.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: '05',
        hour: '05',
        minute: '3',
        month: '',
        year: '',
      },
      recommendedRecallType: '',
      rescindRequestDetail: '',
      rescindRequestEmailReceivedDateParts: {
        day: '',
        month: '43',
        year: '',
      },
      returnedToCustodyDateTimeParts: {
        day: '05',
        hour: '05',
        minute: '3',
        month: '',
        year: '',
      },
      returnedToCustodyNotificationDateTimeParts: {
        day: '05',
        hour: '05',
        minute: '3',
        month: '',
        year: '',
      },
      sentenceDateParts: {
        day: '05',
        month: '',
        year: '2020',
      },
      sentenceExpiryDateParts: {
        day: '',
        month: '',
        year: '',
      },
      sentenceLengthParts: {
        days: '',
        months: 'rr',
        years: '',
      },
      sentencingCourt: '',
      vulnerabilityDiversity: '',
      vulnerabilityDiversityDetail: '',
      warrantReferenceNumber: '',
    })
  })

  it('uses API values in addition to the one error value, if no unsaved values', () => {
    const formValues = getFormValues({
      errors: { lastReleaseDate: errors.lastReleaseDate },
      unsavedValues: {},
      apiValues: apiValues as DecoratedRecall,
    })
    expect(formValues).toEqual({
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'one, two',
      agreeWithRecall: 'YES',
      agreeWithRecallDetailYes: 'Reasons...',
      arrestIssues: 'YES',
      arrestIssuesDetail: 'Detail...',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
      bookingNumber: 'A123456',
      conditionalReleaseDateParts: {
        day: '03',
        month: '12',
        year: '2021',
      },
      contraband: 'YES',
      contrabandDetail: 'Intention to smuggle drugs',
      currentPrison: 'KTI',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: 'AC3408303',
      dossierEmailSentDateParts: {
        day: '08',
        month: '09',
        year: '2021',
      },
      hasDossierBeenChecked: 'YES',
      inCustodyAtBooking: 'NO',
      inCustodyAtAssessment: 'YES',
      previousConvictionMainNameCategory: 'OTHER',
      indexOffence: 'Burglary',
      lastKnownAddressOption: 'YES',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: 'KTI',
      licenceConditionsBreached: '(i) one (ii) two',
      licenceExpiryDateParts: {
        day: '03',
        month: '08',
        year: '2021',
      },
      localPoliceForceId: 'devon-and-cornwall',
      mappaLevel: 'LEVEL_1',
      missingDocumentsDetail: 'Documents were requested by email on 10/12/2020',
      previousConvictionMainName: 'Walter Holt',
      localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
      probationOfficerEmail: 'probation.office@justice.com',
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      reasonsForRecall: ['OTHER', 'ELM_FAILURE_CHARGE_BATTERY'],
      reasonsForRecallOtherDetail: 'other reason detail...',
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '2020',
      },
      recallNotificationEmailFileName: '2021-07-03 Phil Jones recall.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: '15',
        hour: '14',
        minute: '04',
        month: '08',
        year: '2021',
      },
      recommendedRecallType: 'FIXED',
      returnedToCustodyDateTimeParts: {
        day: '22',
        hour: '13',
        minute: '45',
        month: '01',
        year: '2022',
      },
      returnedToCustodyNotificationDateTimeParts: {
        day: '23',
        hour: '08',
        minute: '22',
        month: '01',
        year: '2022',
      },
      sentenceDateParts: {
        day: '03',
        month: '08',
        year: '2019',
      },
      sentenceExpiryDateParts: {
        day: '03',
        month: '02',
        year: '2021',
      },
      sentenceLengthParts: {
        days: 0,
        months: 3,
        years: 2,
      },
      sentencingCourt: 'ABDRCT',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'Various...',
      warrantReferenceNumber: '02RC/1234567C12345',
    })
  })

  it('uses all API values if no error or unsaved values', () => {
    const formValues = getFormValues({
      errors: {},
      unsavedValues: {},
      apiValues: {
        ...(apiValues as DecoratedRecall),
        agreeWithRecall: RecallResponse.agreeWithRecall.NO_STOP,
        agreeWithRecallDetail: 'Reasons for no...',
      },
    })
    expect(formValues).toEqual({
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'one, two',
      agreeWithRecall: 'NO_STOP',
      agreeWithRecallDetailNo: 'Reasons for no...',
      arrestIssues: 'YES',
      arrestIssuesDetail: 'Detail...',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
      bookingNumber: 'A123456',
      conditionalReleaseDateParts: {
        day: '03',
        month: '12',
        year: '2021',
      },
      contraband: 'YES',
      contrabandDetail: 'Intention to smuggle drugs',
      currentPrison: 'KTI',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: 'AC3408303',
      dossierEmailSentDateParts: {
        day: '08',
        month: '09',
        year: '2021',
      },
      hasDossierBeenChecked: 'YES',
      previousConvictionMainNameCategory: 'OTHER',
      inCustodyAtBooking: 'NO',
      inCustodyAtAssessment: 'YES',
      indexOffence: 'Burglary',
      lastKnownAddressOption: 'YES',
      lastReleaseDateParts: {
        day: '03',
        month: '08',
        year: '2020',
      },
      lastReleasePrison: 'KTI',
      licenceConditionsBreached: '(i) one (ii) two',
      licenceExpiryDateParts: {
        day: '03',
        month: '08',
        year: '2021',
      },
      localPoliceForceId: 'devon-and-cornwall',
      mappaLevel: 'LEVEL_1',
      missingDocumentsDetail: 'Documents were requested by email on 10/12/2020',
      previousConvictionMainName: 'Walter Holt',
      localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
      probationOfficerEmail: 'probation.office@justice.com',
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      reasonsForRecall: ['OTHER', 'ELM_FAILURE_CHARGE_BATTERY'],
      reasonsForRecallOtherDetail: 'other reason detail...',
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '2020',
      },
      recallNotificationEmailFileName: '2021-07-03 Phil Jones recall.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: '15',
        hour: '14',
        minute: '04',
        month: '08',
        year: '2021',
      },
      recommendedRecallType: 'FIXED',
      returnedToCustodyDateTimeParts: {
        day: '22',
        hour: '13',
        minute: '45',
        month: '01',
        year: '2022',
      },
      returnedToCustodyNotificationDateTimeParts: {
        day: '23',
        hour: '08',
        minute: '22',
        month: '01',
        year: '2022',
      },
      sentenceDateParts: {
        day: '03',
        month: '08',
        year: '2019',
      },
      sentenceExpiryDateParts: {
        day: '03',
        month: '02',
        year: '2021',
      },
      sentenceLengthParts: {
        days: 0,
        months: 3,
        years: 2,
      },
      sentencingCourt: 'ABDRCT',
      vulnerabilityDiversity: 'YES',
      vulnerabilityDiversityDetail: 'Various...',
      warrantReferenceNumber: '02RC/1234567C12345',
    })
  })

  it('sets values to undefined if none supplied', () => {
    const formValues = getFormValues({ errors: {}, unsavedValues: {}, apiValues: {} as DecoratedRecall })
    expect(formValues).toEqual({})
  })
})
