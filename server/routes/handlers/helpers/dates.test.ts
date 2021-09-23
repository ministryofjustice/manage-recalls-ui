import { convertGmtDatePartsToUtc, formatDateTimeFromIsoString, splitIsoDateToParts } from './dates'

describe('Date helpers', () => {
  describe('convertGmtDatePartsToUtc', () => {
    it('returns an ISO formatted UTC date for valid date-time parts that fall within BST period', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '05', day: '30', hour: '14', minute: '12' })
      expect(result).toEqual('2021-05-30T13:12:00.000Z')
    })

    it('returns an ISO formatted UTC date for valid date parts', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '05', day: '30' })
      expect(result).toEqual('2021-05-30')
    })

    it('returns an ISO formatted UTC date for valid date-time parts that fall outside BST period', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12', hour: '11', minute: '40' })
      expect(result).toEqual('2021-01-12T11:40:00.000Z')
    })

    it('returns an ISO formatted UTC date-time for a valid date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12', hour: '10', minute: '53' })
      expect(result).toEqual('2021-01-12T10:53:00.000Z')
    })

    it('returns an ISO formatted UTC date for a valid date', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '01', day: '12' })
      expect(result).toEqual('2021-01-12')
    })

    it('returns undefined for a date with any part missing', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '3', day: '20' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a date with any part over the max allowed value', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '32', day: '45' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a 29 Feb date not in a leap year', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '2', day: '29' })
      expect(result).toBeUndefined()
    })

    it('returns an ISO formatted UTC date for a 29 Feb date in a leap year', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '2', day: '29' })
      expect(result).toEqual('2020-02-29')
    })

    it('returns undefined for a date with any date part having a negative value', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '-5', day: '12' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a date-time with any hour part having a negative value', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '5', day: '12', hour: '-10', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a date-time with any hour part having a value out of bounds', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '5', day: '12', hour: '24', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a date-time with any minute part having a negative value', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '5', day: '12', hour: '-10', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a date-time with any minute part having a value out of bounds', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '5', day: '12', hour: '23', minute: '60' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a date-time with any part missing', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '', day: '25', hour: '10', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a blank date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '', hour: '', minute: '' })
      expect(result).toBeUndefined()
    })

    it('returns undefined if a date-time must be in the past but is in the future', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2050', month: '12', day: '10', hour: '23', minute: '12' },
        { dateMustBeInPast: true }
      )
      expect(result).toBeUndefined()
    })

    it('returns undefined if a date must be in the past but is in the future', () => {
      const result = convertGmtDatePartsToUtc({ year: '2045', month: '03', day: '04' }, { dateMustBeInPast: true })
      expect(result).toBeUndefined()
    })

    it('returns undefined if a date-time must be in the future but is in the past', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2020', month: '12', day: '10', hour: '23', minute: '12' },
        { dateMustBeInFuture: true }
      )
      expect(result).toBeUndefined()
    })

    it('returns undefined if a date must be in the future but is in the past', () => {
      const result = convertGmtDatePartsToUtc({ year: '2020', month: '03', day: '04' }, { dateMustBeInFuture: true })
      expect(result).toBeUndefined()
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
      expect(formatted).toEqual('22 June 2021 at 9:43am')
    })

    it('formats a date-time, not adjusted if outside daylight saving', () => {
      const formatted = formatDateTimeFromIsoString('2021-12-22T18:43:00.000Z')
      expect(formatted).toEqual('22 December 2021 at 6:43pm')
    })
  })
})
