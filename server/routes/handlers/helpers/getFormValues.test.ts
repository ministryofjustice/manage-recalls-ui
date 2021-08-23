import { getFormValues } from './getFormValues'
import { FormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api'
import { updateRecallResponse } from './index.test'

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
    localPoliceService: {
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
    localPoliceService: 'Weymouth',
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
      indexOffence: '',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: '',
      licenceExpiryDateParts: {
        day: '05',
        month: '',
        year: '',
      },
      localPoliceService: '',
      mappaLevel: '',
      probationDivision: '',
      probationOfficerEmail: '',
      probationOfficerName: '',
      probationOfficerPhoneNumber: '',
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
      indexOffence: 'Assault',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: 'Portland',
      licenceExpiryDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      localPoliceService: 'Weymouth',
      mappaLevel: 'LEVEL_2',
      probationDivision: 'SOUTH_WEST',
      probationOfficerEmail: 'andy@probation.gov.uk',
      probationOfficerName: 'Andy Fleming',
      probationOfficerPhoneNumber: '0739738383',
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
      indexOffence: '',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: '',
      licenceExpiryDateParts: {
        day: '05',
        month: '',
        year: '',
      },
      localPoliceService: '',
      mappaLevel: '',
      probationDivision: '',
      probationOfficerEmail: '',
      probationOfficerName: '',
      probationOfficerPhoneNumber: '',
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
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: 'ee',
        month: 'rr',
        year: 'www',
      },
      lastReleasePrison: 'Belmarsh',
      licenceExpiryDateParts: {
        day: 3,
        month: 8,
        year: 2021,
      },
      localPoliceService: 'Brentwood, Essex',
      mappaLevel: 'LEVEL_1',
      probationDivision: 'LONDON',
      probationOfficerEmail: 'probation.office@justice.com',
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
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
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: 3,
        month: 8,
        year: 2020,
      },
      lastReleasePrison: 'Belmarsh',
      licenceExpiryDateParts: {
        day: 3,
        month: 8,
        year: 2021,
      },
      localPoliceService: 'Brentwood, Essex',
      mappaLevel: 'LEVEL_1',
      probationDivision: 'LONDON',
      probationOfficerEmail: 'probation.office@justice.com',
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
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
