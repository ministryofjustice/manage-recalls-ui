// @ts-nocheck
import {
  getFormattedRecallLength,
  makeErrorObject,
  splitIsoDateToParts,
  convertGmtDatePartsToUtc,
  getFormattedMappaLevel,
  getFormValues,
} from './index'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import updateRecallResponseJson from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

describe('getFormattedRecallLength', () => {
  it('returns a string if recall length is 14 days', () => {
    const value = getFormattedRecallLength(RecallResponse.recallLength.FOURTEEN_DAYS)
    expect(value).toEqual('14 days')
  })

  it('returns a string if recall length is 28 days', () => {
    const value = getFormattedRecallLength(RecallResponse.recallLength.TWENTY_EIGHT_DAYS)
    expect(value).toEqual('28 days')
  })

  it('returns an empty string if recall length is empty', () => {
    const value = getFormattedRecallLength()
    expect(value).toEqual('')
  })
})

describe('makeErrorObject', () => {
  it('returns an error object', () => {
    const error = makeErrorObject({
      id: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: { year: '2021', month: '10', day: '3', hour: '', minute: '' },
    })
    expect(error).toEqual({
      href: '#recallEmailReceivedDateTime',
      name: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: {
        day: '3',
        hour: '',
        minute: '',
        month: '10',
        year: '2021',
      },
    })
  })
})

describe('Date helpers', () => {
  describe('validateDate', () => {
    it('returns a UTC corrected date object for a valid date-time that falls within BST period', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '05', day: '30', hour: '14', minute: '12' })
      expect(result).toEqual('2021-05-30T13:12:00.000Z')
    })

    it("doesn't apply daylight saving for dates without times within BST period", () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '05', day: '30' })
      expect(result).toEqual('2021-05-30')
    })

    it('returns a UTC corrected date object for a valid date-time that falls outside BST period', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12', hour: '11', minute: '40' })
      expect(result).toEqual('2021-01-12T11:40:00.000Z')
    })

    it('returns a date object for a valid date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12', hour: '10', minute: '53' })
      expect(result).toEqual('2021-01-12T10:53:00.000Z')
    })

    it('returns a date object for a valid date', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12' })
      expect(result).toEqual('2021-01-12')
    })

    it('returns null for an invalid date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '', day: '45', hour: '10', minute: '53' })
      expect(result).toBeNull()
    })

    it('returns null for a blank date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '', hour: '', minute: '' })
      expect(result).toBeNull()
    })
  })

  describe('splitIsoDateToParts', () => {
    it('returns date parts for a given ISO date string, with hours corrected for the current time zone', () => {
      const result = splitIsoDateToParts('2021-05-30T13:12:00.000Z')
      expect(result).toEqual({
        year: 2021,
        month: 5,
        day: 30,
        hour: 14,
        minute: 12,
      })
    })

    it('returns undefined if passed an empty date string', () => {
      const result = splitIsoDateToParts()
      expect(result).toBeUndefined()
    })
  })
})

describe('getFormattedMappaLevel', () => {
  it('returns a string if recall length is level 1', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.LEVEL_1)
    expect(value).toEqual('Level 1')
  })

  it('returns a string if recall length is Level 2', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.LEVEL_2)
    expect(value).toEqual('Level 2')
  })

  it('returns a string if recall length is Level 3', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.LEVEL_3)
    expect(value).toEqual('Level 3')
  })

  it('returns a string if recall length is N/A', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.NA)
    expect(value).toEqual('N/A')
  })

  it('returns a string if recall length is CONFIRMATION_REQUIRED', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.CONFIRMATION_REQUIRED)
    expect(value).toEqual('Confirmation required')
  })

  it('returns a string if recall length is Not known', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.NOT_KNOWN)
    expect(value).toEqual('Not known')
  })

  it('returns an empty string if recall length is empty', () => {
    const value = getFormattedMappaLevel()
    expect(value).toEqual('')
  })
})

describe('getFormValues', () => {
  const errors = {
    recallEmailReceivedDateTime: { values: { year: '2020', month: '12', day: '05', hour: '15', minute: '33' } },
    lastReleasePrison: '',
    sentenceDate: { values: { year: '2020', month: '12', day: '05' } },
    sentenceExpiryDate: { values: { year: '2020', month: '12', day: '05' } },
    licenceExpiryDate: { values: { year: '2020', month: '12', day: '05' } },
    conditionalReleaseDate: { values: { year: '2020', month: '12', day: '05' } },
    lastReleaseDate: { values: { year: '2020', month: '12', day: '05' } },
    localPoliceService: '',
    sentencingCourt: '',
    indexOffence: '',
    contrabandDetail: '',
    vulnerabilityDiversityDetail: '',
    mappaLevel: '',
  }

  it('uses error values if no API values', () => {
    const formValues = getFormValues({ errors, apiValues: {} })
    expect(formValues).toEqual({
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      lastReleaseDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      licenceExpiryDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
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
    })
  })

  it('uses error values over API values', () => {
    const formValues = getFormValues({ errors, apiValues: updateRecallResponseJson })
    expect(formValues).toEqual({
      conditionalReleaseDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      contrabandDetail: 'Intention to smuggle drugs',
      indexOffence: 'Burglary',
      lastReleaseDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      lastReleasePrison: 'Belmarsh',
      licenceExpiryDateParts: {
        day: '05',
        month: '12',
        year: '2020',
      },
      localPoliceService: 'Brentwood, Essex',
      mappaLevel: 'LEVEL_1',
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
      sentencingCourt: 'Manchester Crown Court',
      vulnerabilityDiversityDetail: 'Various...',
    })
  })

  it('uses API values if no error values', () => {
    const formValues = getFormValues({ errors: {}, apiValues: updateRecallResponseJson })
    expect(formValues).toEqual({
      conditionalReleaseDateParts: {
        day: 3,
        month: 12,
        year: 2021,
      },
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
      sentencingCourt: 'Manchester Crown Court',
      vulnerabilityDiversityDetail: 'Various...',
    })
  })

  it('sets values to undefined if none supplied', () => {
    const formValues = getFormValues({ errors: {}, apiValues: {} })
    expect(formValues).toEqual({})
  })
})
