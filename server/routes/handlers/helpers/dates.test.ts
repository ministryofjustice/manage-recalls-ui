import { convertGmtDatePartsToUtc, splitIsoDateToParts } from './dates'

describe('Date helpers', () => {
  describe('convertGmtDatePartsToUtc', () => {
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

    it('returns undefined for an invalid date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '', day: '45', hour: '10', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for an invalid month', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '13', day: '45', hour: '10', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for an invalid day', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '1', day: '45', hour: '10', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for an invalid hour', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '1', day: '1', hour: '55', minute: '53' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for an invalid minute', () => {
      const result = convertGmtDatePartsToUtc({ year: '2021', month: '1', day: '1', hour: '1', minute: '65' })
      expect(result).toBeUndefined()
    })

    it('returns undefined for a blank date-time', () => {
      const result = convertGmtDatePartsToUtc({ year: '', month: '', day: '', hour: '', minute: '' })
      expect(result).toBeUndefined()
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
