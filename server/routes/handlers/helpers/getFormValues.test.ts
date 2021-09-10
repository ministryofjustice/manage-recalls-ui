import { getFormValues } from './getFormValues'
import { RecallResponseWithDocuments, FormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import updateRecallResponse from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { decorateDocs } from './index'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

describe('getFormValues', () => {
  const errors = {
    agreeWithRecall: {
      text: 'Decision on recall',
    },
    agreeWithRecallDetailYes: {
      text: 'Provide more detail',
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
    localPoliceForce: {
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
    },
    probationOfficerEmail: {
      text: 'Email',
    },
    probationDivision: {
      text: 'Division',
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
      values: 'recall-notification.msg',
    },
  } as unknown as ObjectMap<FormError>
  const unsavedValues = {
    agreeWithRecall: 'NO',
    agreeWithRecallDetail: 'Reasons for no...',
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
    localPoliceForce: 'Dorset',
    sentencingCourt: 'Dorchester',
    indexOffence: 'Assault',
    contraband: 'yes',
    contrabandDetail: 'Likelihood of smuggling knives',
    vulnerabilityDiversity: 'no',
    vulnerabilityDiversityDetail: '',
    mappaLevel: 'LEVEL_2',
    bookingNumber: '87378435D',
    probationOfficerName: 'Andy Fleming',
    probationOfficerPhoneNumber: '0739738383',
    probationOfficerEmail: 'andy@probation.gov.uk',
    probationDivision: 'SOUTH_WEST',
    authorisingAssistantChiefOfficer: 'Carrie Grant',
    licenceConditionsBreached: '(iii) three \n (iv) four',
    reasonsForRecall: ['POOR_BEHAVIOUR_NON_COMPLIANCE'],
    reasonsForRecallOtherDetail: '',
    currentPrison: 'ACL',
    recallNotificationEmailFileName: 'recall.msg',
  }

  const apiValues = {
    ...updateRecallResponse,
    ...decorateDocs({
      docs: updateRecallResponse.documents as ApiRecallDocument[],
      nomsNumber: '123',
      recallId: '456',
    }),
  }
  it('uses errors if no unsaved or API values', () => {
    const formValues = getFormValues({ errors, unsavedValues: {}, apiValues: {} as RecallResponseWithDocuments })
    expect(formValues).toEqual({
      agreeWithRecall: '',
      authorisingAssistantChiefOfficer: '',
      bookingNumber: '',
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '',
      },
      contraband: '',
      contrabandDetail: '',
      currentPrison: '',
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
      localPoliceForce: '',
      mappaLevel: '',
      probationDivision: '',
      probationOfficerEmail: '',
      probationOfficerName: '',
      probationOfficerPhoneNumber: '',
      reasonsForRecall: '',
      reasonsForRecallOtherDetail: '',
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '',
      },
      recallNotificationEmailFileName: 'recall-notification.msg',
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
    })
  })

  it('uses unsaved values if there is one error value but no API values', () => {
    const formValues = getFormValues({
      errors: { lastReleaseDate: errors.lastReleaseDate },
      unsavedValues,
      apiValues: {} as RecallResponseWithDocuments,
    })
    expect(formValues).toEqual({
      agreeWithRecall: 'NO',
      authorisingAssistantChiefOfficer: 'Carrie Grant',
      bookingNumber: '87378435D',
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      contraband: 'yes',
      contrabandDetail: 'Likelihood of smuggling knives',
      currentPrison: 'ACL',
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
      localPoliceForce: 'Dorset',
      mappaLevel: 'LEVEL_2',
      probationDivision: 'SOUTH_WEST',
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
      vulnerabilityDiversity: 'no',
    })
  })

  it('uses all error values over unsaved values', () => {
    const formValues = getFormValues({ errors, unsavedValues, apiValues: {} as RecallResponseWithDocuments })
    expect(formValues).toEqual({
      agreeWithRecall: '',
      authorisingAssistantChiefOfficer: '',
      bookingNumber: '',
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '',
      },
      contraband: '',
      contrabandDetail: '',
      currentPrison: '',
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
      localPoliceForce: '',
      mappaLevel: '',
      probationDivision: '',
      probationOfficerEmail: '',
      probationOfficerName: '',
      probationOfficerPhoneNumber: '',
      reasonsForRecall: '',
      reasonsForRecallOtherDetail: '',
      recallEmailReceivedDateTimeParts: {
        day: '05',
        hour: '15',
        minute: '33',
        month: '12',
        year: '',
      },
      recallNotificationEmailFileName: 'recall-notification.msg',
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
    })
  })

  it('uses API values in addition to the one error value, if no unsaved values', () => {
    const formValues = getFormValues({
      errors: { lastReleaseDate: errors.lastReleaseDate },
      unsavedValues: {},
      apiValues: apiValues as RecallResponseWithDocuments,
    })
    expect(formValues).toEqual({
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'one, two',
      agreeWithRecall: 'YES',
      agreeWithRecallDetailYes: 'Reasons...',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
      bookingNumber: 'A123456',
      conditionalReleaseDateParts: {
        day: 3,
        month: 12,
        year: 2021,
      },
      contraband: 'yes',
      contrabandDetail: 'Intention to smuggle drugs',
      currentPrison: 'KTI',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: 'AC3408303',
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: 'KTI',
      licenceConditionsBreached: '(i) one (ii) two',
      licenceExpiryDateParts: {
        day: 3,
        month: 8,
        year: 2021,
      },
      localPoliceForce: 'Essex',
      mappaLevel: 'LEVEL_1',
      probationDivision: 'LONDON',
      probationOfficerEmail: 'probation.office@justice.com',
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      reasonsForRecall: ['OTHER', 'ELM_FAILURE_CHARGE_BATTERY'],
      reasonsForRecallOtherDetail: 'other reason detail...',
      recallEmailReceivedDateTimeParts: {
        day: 5,
        hour: 15,
        minute: 33,
        month: 12,
        year: 2020,
      },
      recallNotificationEmailFileName: '2021-07-03 Phil Jones recall.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: 15,
        hour: 14,
        minute: 4,
        month: 8,
        year: 2021,
      },
      sentenceDateParts: {
        day: 3,
        month: 8,
        year: 2019,
      },
      sentenceExpiryDateParts: {
        day: 3,
        month: 2,
        year: 2021,
      },
      sentenceLengthParts: {
        days: 0,
        months: 3,
        years: 2,
      },
      sentencingCourt: 'Manchester Crown Court',
      vulnerabilityDiversity: 'yes',
      vulnerabilityDiversityDetail: 'Various...',
    })
  })

  it('uses all API values if no error or unsaved values', () => {
    const formValues = getFormValues({
      errors: {},
      unsavedValues: {},
      apiValues: {
        ...(apiValues as RecallResponseWithDocuments),
        agreeWithRecall: RecallResponse.agreeWithRecall.NO_STOP,
        agreeWithRecallDetail: 'Reasons for no...',
      },
    })
    expect(formValues).toEqual({
      additionalLicenceConditions: 'YES',
      additionalLicenceConditionsDetail: 'one, two',
      agreeWithRecall: 'NO_STOP',
      agreeWithRecallDetailNo: 'Reasons for no...',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
      bookingNumber: 'A123456',
      conditionalReleaseDateParts: {
        day: 3,
        month: 12,
        year: 2021,
      },
      contraband: 'yes',
      contrabandDetail: 'Intention to smuggle drugs',
      currentPrison: 'KTI',
      differentNomsNumber: 'YES',
      differentNomsNumberDetail: 'AC3408303',
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: 3,
        month: 8,
        year: 2020,
      },
      lastReleasePrison: 'KTI',
      licenceConditionsBreached: '(i) one (ii) two',
      licenceExpiryDateParts: {
        day: 3,
        month: 8,
        year: 2021,
      },
      localPoliceForce: 'Essex',
      mappaLevel: 'LEVEL_1',
      probationDivision: 'LONDON',
      probationOfficerEmail: 'probation.office@justice.com',
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      reasonsForRecall: ['OTHER', 'ELM_FAILURE_CHARGE_BATTERY'],
      reasonsForRecallOtherDetail: 'other reason detail...',
      recallEmailReceivedDateTimeParts: {
        day: 5,
        hour: 15,
        minute: 33,
        month: 12,
        year: 2020,
      },
      recallNotificationEmailSentDateTimeParts: {
        day: 15,
        hour: 14,
        minute: 4,
        month: 8,
        year: 2021,
      },
      recallNotificationEmailFileName: '2021-07-03 Phil Jones recall.msg',
      sentenceDateParts: {
        day: 3,
        month: 8,
        year: 2019,
      },
      sentenceExpiryDateParts: {
        day: 3,
        month: 2,
        year: 2021,
      },
      sentenceLengthParts: {
        days: 0,
        months: 3,
        years: 2,
      },
      sentencingCourt: 'Manchester Crown Court',
      vulnerabilityDiversity: 'yes',
      vulnerabilityDiversityDetail: 'Various...',
    })
  })

  it('sets values to undefined if none supplied', () => {
    const formValues = getFormValues({ errors: {}, unsavedValues: {}, apiValues: {} as RecallResponseWithDocuments })
    expect(formValues).toEqual({})
  })
})
