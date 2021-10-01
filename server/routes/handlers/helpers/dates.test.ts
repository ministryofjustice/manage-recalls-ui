import { DateTime } from 'luxon'
import { convertGmtDatePartsToUtc, formatDateTimeFromIsoString, splitIsoDateToParts } from './dates'

describe('Date helpers', () => {
  describe('convertGmtDatePartsToUtc', () => {
    it('returns an ISO formatted UTC date for valid date-time parts that fall within BST period', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2021', month: '05', day: '30', hour: '14', minute: '12' },
        { includeTime: true }
      )
      expect(result).toEqual('2021-05-30T13:12:00.000Z')
    })

    it('returns an ISO formatted UTC date for valid date parts', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '05', day: '30' })
      expect(result).toEqual('2021-05-30')
    })

    it('returns an ISO formatted UTC date for valid date-time parts that fall outside BST period', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2021', month: '01', day: '12', hour: '11', minute: '40' },
        { includeTime: true }
      )
      expect(result).toEqual('2021-01-12T11:40:00.000Z')
    })

    it('returns an ISO formatted UTC date-time for a valid date-time', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2021', month: '01', day: '12', hour: '10', minute: '53' },
        { includeTime: true }
      )
      expect(result).toEqual('2021-01-12T10:53:00.000Z')
    })

    it('returns an ISO formatted UTC date for a valid date', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12' })
      expect(result).toEqual('2021-01-12')
    })

    it('returns an error for a date with all parts missing', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '' })
      expect(result).toEqual({ error: 'blankDateTime' })
    })

    it('returns an error for a date-time with all parts missing', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '', hour: '', minute: '' })
      expect(result).toEqual({ error: 'blankDateTime' })
    })

    it('returns an error for a date with any part missing', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '3', day: '20' })
      expect(result).toEqual({ error: 'missingDateParts', invalidParts: ['year'] })
    })

    it('returns an error for a date-time with any part not being an integer', () => {
      const result = convertGmtDatePartsToUtc(
        { year: 'ff', month: '3.2', day: '-0.5', hour: 'ab1', minute: '-100' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'invalidDate' })
    })

    it('returns an error for a date with any part over the max allowed value', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '32', day: '45' })
      expect(result).toEqual({ error: 'invalidDate' })
    })

    it('returns undefined for a 29 Feb date not in a leap year', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '2', day: '29' })
      expect(result).toEqual({ error: 'invalidDate' })
    })

    it('returns an ISO formatted UTC date for a 29 Feb date in a leap year', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '2', day: '29' })
      expect(result).toEqual('2020-02-29')
    })

    it('returns an error for a date with any date part having a negative value', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '-5', day: '12' })
      expect(result).toEqual({ error: 'invalidDate' })
    })

    it('returns an error for a date-time with any hour part having a negative value', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '5', day: '12', hour: '-10', minute: '53' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'invalidTime' })
    })

    it('returns an error for a date-time with any hour part over the max allowed value', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '5', day: '12', hour: '24', minute: '53' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'invalidTime' })
    })

    it('returns an error for a date-time with any minute part having a negative value', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '5', day: '12', hour: '-10', minute: '53' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'invalidTime' })
    })

    it('returns an error for a date-time with any minute part having a value out of bounds', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '5', day: '12', hour: '23', minute: '60' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'invalidTime' })
    })

    it('returns an error for a date-time with parts missing from date and time', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '', month: '3', day: '20', hour: '', minute: '5' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'missingDateParts', invalidParts: ['year', 'hour'] })
    })

    it('returns an error for a date with any parts missing', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '', day: '' })
      expect(result).toEqual({ error: 'missingDateParts', invalidParts: ['month', 'day'] })
    })

    it('returns an error for a date-time with any time parts missing', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2021', month: '3', day: '25', hour: '', minute: '' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'missingDateParts', invalidParts: ['hour', 'minute'] })
    })

    it('returns an error if a date-time must be in the past but is in the future', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2050', month: '12', day: '10', hour: '23', minute: '12' },
        { dateMustBeInPast: true, includeTime: true }
      )
      expect(result).toEqual({ error: 'dateMustBeInPast' })
    })

    it('returns an error if a date must be in the past but is in the future', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2045', month: '03', day: '04' },
        { dateMustBeInPast: true, includeTime: false }
      )
      expect(result).toEqual({ error: 'dateMustBeInPast' })
    })

    it('returns valid date string if a date must be in the past and is today', () => {
      const today = DateTime.now()
      const { year, month, day } = today
      const result = convertGmtDatePartsToUtc(
        { year: year.toString(), month: month.toString(), day: day.toString() },
        { dateMustBeInPast: true, includeTime: false }
      )
      expect(result).toEqual(today.toISODate())
    })

    it('returns an error if a date-time must be in the future but is in the past', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '12', day: '10', hour: '23', minute: '12' },
        { dateMustBeInFuture: true, includeTime: true }
      )
      expect(result).toEqual({ error: 'dateMustBeInFuture' })
    })

    it('returns an error if a date must be in the future but is in the past', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '03', day: '04' },
        { dateMustBeInFuture: true, includeTime: false }
      )
      expect(result).toEqual({ error: 'dateMustBeInFuture' })
    })
  })

  describe('splitIsoDateToParts', () => {
    it('returns date parts for a given ISO date-time string, with hours corrected if inside DST', () => {
      const result = splitIsoDateToParts('2021-05-30T13:12:00.000Z')
      expect(result).toEqual({
        year: 2021,
        month: 5,
        day: 30,
        hour: 14,
        minute: 12,
      })
    })

    it('returns date parts for a given ISO date-time string, with hours not corrected if outside DST', () => {
      const result = splitIsoDateToParts('2021-11-12T08:43:00.000Z')
      expect(result).toEqual({
        year: 2021,
        month: 11,
        day: 12,
        hour: 8,
        minute: 43,
      })
    })

    it('returns date parts for a given ISO date string', () => {
      const result = splitIsoDateToParts('2021-05-30')
      expect(result).toEqual({
        year: 2021,
        month: 5,
        day: 30,
      })
    })

    it('returns undefined if passed an empty date string', () => {
      const result = splitIsoDateToParts()
      expect(result).toBeUndefined()
    })
  })

  describe('formatDateTimeFromIsoString', () => {
    it('formats a date', () => {
      const formatted = formatDateTimeFromIsoString('2021-11-12')
      expect(formatted).toEqual('12 November 2021')
    })

    it('formats a date-time, adjusted if inside daylight saving', () => {
      const formatted = formatDateTimeFromIsoString('2021-06-22T08:43:00.000Z')
      expect(formatted).toEqual('22 June 2021 at 09:43')
    })

    it('formats a date-time, not adjusted if outside daylight saving', () => {
      const formatted = formatDateTimeFromIsoString('2021-12-22T08:43:00.000Z')
      expect(formatted).toEqual('22 December 2021 at 08:43')
    })
  })
})
