import { getFormValues } from './getFormValues'
import { FormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api'

const updateRecallResponse = {
  recallId: '8ab377a6-4587-2598-abc4-98fc53737',
  nomsNumber: 'A1234AA',
  recallLength: 'FOURTEEN_DAYS',
  agreeWithRecallRecommendation: true,
  documents: [
    {
      category: 'LICENCE',
      documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    },
    {
      category: 'PART_A_RECALL_REPORT',
      documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
    },
  ],
  revocationOrderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  recallEmailReceivedDateTime: '2020-12-05T15:33:57.000Z',
  lastReleasePrison: 'Belmarsh',
  sentenceDate: '2019-08-03',
  sentenceExpiryDate: '2021-02-03',
  licenceExpiryDate: '2021-08-03',
  conditionalReleaseDate: '2021-12-03',
  lastReleaseDate: '2020-08-03',
  localPoliceForce: 'Essex',
  sentencingCourt: 'Manchester Crown Court',
  indexOffence: 'Burglary',
  contrabandDetail: 'Intention to smuggle drugs',
  vulnerabilityDiversityDetail: 'Various...',
  mappaLevel: 'LEVEL_1',
  sentenceLength: {
    years: 2,
    months: 3,
    days: 0,
  },
  bookingNumber: 'A123456',
  probationOfficerName: 'Dave Angel',
  probationOfficerPhoneNumber: '07473739388',
  probationOfficerEmail: 'probation.office@justice.com',
  probationDivision: 'LONDON',
  authorisingAssistantChiefOfficer: 'Bob Monkfish',
  licenceConditionsBreached: '(i) one \n (ii) two',
  reasonsForRecall: ['OTHER', 'ELM_FAILURE_CHARGE_BATTERY'],
  reasonsForRecallOtherDetail: 'other reason detail...',
  currentPrison: 'BLI',
}

describe('getFormValues', () => {
  const errors = {
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
      text: 'Licence conditions breached',
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
  } as unknown as ObjectMap<FormError>
  const unsavedValues = {
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
  }

  it('uses errors if no unsaved or API values', () => {
    const formValues = getFormValues({ errors, unsavedValues: {}, apiValues: {} as RecallResponse })
    expect(formValues).toEqual({
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
      apiValues: {} as RecallResponse,
    })
    expect(formValues).toEqual({
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
    const formValues = getFormValues({ errors, unsavedValues, apiValues: {} as RecallResponse })
    expect(formValues).toEqual({
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
      apiValues: updateRecallResponse as RecallResponse,
    })
    expect(formValues).toEqual({
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
      bookingNumber: 'A123456',
      conditionalReleaseDateParts: {
        day: 3,
        month: 12,
        year: 2021,
      },
      contraband: 'yes',
      contrabandDetail: 'Intention to smuggle drugs',
      currentPrison: 'BLI',
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: 'Belmarsh',
      licenceConditionsBreached: '(i) one \n (ii) two',
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
      apiValues: updateRecallResponse as RecallResponse,
    })
    expect(formValues).toEqual({
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
      bookingNumber: 'A123456',
      conditionalReleaseDateParts: {
        day: 3,
        month: 12,
        year: 2021,
      },
      contraband: 'yes',
      contrabandDetail: 'Intention to smuggle drugs',
      currentPrison: 'BLI',
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: 3,
        month: 8,
        year: 2020,
      },
      lastReleasePrison: 'Belmarsh',
      licenceConditionsBreached: '(i) one \n (ii) two',
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
    const formValues = getFormValues({ errors: {}, unsavedValues: {}, apiValues: {} as RecallResponse })
    expect(formValues).toEqual({})
  })
})
