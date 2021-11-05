import { DateTime, Duration } from 'luxon'
import {
  convertGmtDatePartsToUtc,
  dossierDueDateString,
  formatDateTimeFromIsoString,
  dueDateLabel,
  recallAssessmentDueText,
  splitIsoDateToParts,
} from './dates'
import { sortListByDateField } from './date'

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
      expect(result).toEqual({ error: 'missingDateParts', invalidParts: ['day', 'month'] })
    })

    it('returns an error for a date-time with all date parts missing', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '', month: '', day: '', hour: '3', minute: '4' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'missingDate' })
    })

    it('returns an error for a date-time with any time parts missing', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2021', month: '3', day: '25', hour: '5', minute: '' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'missingDateParts', invalidParts: ['minute'] })
    })

    it('returns an error for a date-time with all time parts missing', () => {
      const result = convertGmtDatePartsToUtc(
        { year: '2021', month: '3', day: '25', hour: '', minute: '' },
        { includeTime: true }
      )
      expect(result).toEqual({ error: 'missingTime' })
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

  describe('recallAssessmentDueText', () => {
    it('from valid overdue UTC isoDate string returns correct overdue recall assessment text in BST', () => {
      const formatted = recallAssessmentDueText('2021-06-22T08:43:00.000Z')
      expect(formatted).toEqual('Overdue: recall assessment was due on 22 June 2021 by 09:43')
    })

    it('from valid overdue UTC isoDate string returns correct overdue recall assessment text outside of BST', () => {
      const formatted = recallAssessmentDueText('2021-02-15T08:43:00.000Z')
      expect(formatted).toEqual('Overdue: recall assessment was due on 15 February 2021 by 08:43')
    })

    it('of undefined returns undefined', () => {
      const formatted = recallAssessmentDueText(undefined)
      expect(formatted).toBeUndefined()
    })

    it('of invalid returns undefined', () => {
      const formatted = recallAssessmentDueText('not an iso date string')
      expect(formatted).toBeUndefined()
    })
  })

  describe('dossierDueText', () => {
    it('from valid overdue due date returns correct overdue message', () => {
      const formatted = dossierDueDateString('2021-06-22T08:43:00.000Z')
      expect(formatted).toEqual('Overdue: Due on')
    })

    it("doesn't show a due date of today as overdue", () => {
      const date = DateTime.now().toString()
      const formatted = dossierDueDateString(date)
      expect(formatted).toEqual('Due on')
    })

    it('from valid not overdue due date returns correct message', () => {
      const date = DateTime.now()
        .plus(Duration.fromObject({ days: 1 }))
        .toString()
      const formatted = dossierDueDateString(date)
      expect(formatted).toEqual('Due on')
    })

    it('of undefined returns undefined', () => {
      const formatted = dossierDueDateString(undefined)
      expect(formatted).toBeUndefined()
    })

    it('of invalid returns undefined', () => {
      const formatted = dossierDueDateString('not an iso date string')
      expect(formatted).toBeUndefined()
    })
  })

  describe('dueDateLabel', () => {
    let dateNowSpy: jest.SpyInstance

    afterAll(() => {
      // Unlock Time
      dateNowSpy.mockRestore()
    })

    describe('dueDateLabel all variants in BST one hour ahead of UTC', () => {
      const dueItemLabel = 'Recall assessment'
      const fixedNow = '2020-07-15T15:10:00.000Z'
      const laterToday = '2020-07-15T15:15:00.000Z'
      const earlierToday = '2020-07-15T15:05:00.000Z'
      const yesterday = '2020-07-14T16:10:00.000Z'
      const tomorrow = '2020-07-16T11:10:00.000Z'
      const afterTomorrow = '2020-07-17T10:10:00.000Z'

      beforeAll(() => {
        // Lock Time
        dateNowSpy = jest.spyOn(DateTime, 'now').mockReturnValue(asUtcDateTime(fixedNow))
      })

      it('due date later today shows today by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: laterToday })
        expect(formatted).toEqual('Recall assessment due today by 16:15')
      })

      it('due date later today shows today by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: laterToday, shortFormat: true })
        expect(formatted).toEqual('Today at 16:15')
      })

      it('due date tomorrow shows tomorrow by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: tomorrow })
        expect(formatted).toEqual('Recall assessment due tomorrow by 12:10')
      })

      it('due date tomorrow shows tomorrow by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: tomorrow, shortFormat: true })
        expect(formatted).toEqual('Tomorrow at 12:10')
      })

      it('due date yesterday shows overdue, date by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: yesterday })
        expect(formatted).toEqual('Overdue: recall assessment was due on 14 July 2020 by 17:10')
      })

      it('due date yesterday shows overdue, date by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: yesterday, shortFormat: true })
        expect(formatted).toEqual('Yesterday at 17:10')
      })

      it('due date earlier today shows overdue today by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: earlierToday })
        expect(formatted).toEqual('Overdue: recall assessment was due today by 16:05')
      })

      it('due date earlier today shows overdue today by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: earlierToday, shortFormat: true })
        expect(formatted).toEqual('Today at 16:05')
      })

      it('due date precisely now shows overdue today by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: fixedNow })
        expect(formatted).toEqual('Overdue: recall assessment was due today by 16:10')
      })

      it('due date precisely now shows overdue today by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: fixedNow, shortFormat: true })
        expect(formatted).toEqual('Today at 16:10')
      })

      it('due date after tomorrow shows due on date by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: afterTomorrow })
        expect(formatted).toEqual('Recall assessment will be due on 17 July 2020 by 11:10')
      })

      it('due date after tomorrow shows due on date by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: afterTomorrow, shortFormat: true })
        expect(formatted).toEqual('17 Jul at 11:10')
      })
    })

    describe('dueDateLabel example outside of BST hence same as UTC', () => {
      const dueItemLabel = 'Recall assessment'
      const fixedNow = '2020-03-15T15:10:00.000Z'
      const laterToday = '2020-03-15T15:15:00.000Z'
      const earlierToday = '2020-03-15T15:05:00.000Z'

      beforeAll(() => {
        // Lock Time
        dateNowSpy = jest.spyOn(DateTime, 'now').mockReturnValue(asUtcDateTime(fixedNow))
      })

      it('due date later today shows today by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: laterToday })
        expect(formatted).toEqual('Recall assessment due today by 15:15')
      })

      it('due date later today shows today by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: laterToday, shortFormat: true })
        expect(formatted).toEqual('Today at 15:15')
      })

      it('due date earlier today shows overdue today by time of day', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: earlierToday })
        expect(formatted).toEqual('Overdue: recall assessment was due today by 15:05')
      })

      it('due date earlier today shows overdue today by time of day - short format', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: earlierToday, shortFormat: true })
        expect(formatted).toEqual('Today at 15:05')
      })
    })

    describe('dueDateLabel for date only, no time', () => {
      const dueItemLabel = 'Dossier'
      const fixedNow = '2020-03-15'
      const yesterday = '2020-03-14'
      const dayBeforeYesterday = '2020-03-13'
      const tomorrow = '2020-03-16'
      const dayAfterTomorrow = '2020-03-17'

      beforeAll(() => {
        // Lock Time
        dateNowSpy = jest.spyOn(DateTime, 'now').mockReturnValue(asUtcDateTime(fixedNow))
      })

      it('due date today shows today', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: fixedNow, includeTime: false })
        expect(formatted).toEqual('Dossier due today')
      })

      it('due date today shows today - short format', () => {
        const formatted = dueDateLabel({
          dueItemLabel,
          dueIsoDateTime: fixedNow,
          shortFormat: true,
          includeTime: false,
        })
        expect(formatted).toEqual('Today')
      })

      it('due date yesterday shows overdue', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: yesterday, includeTime: false })
        expect(formatted).toEqual('Overdue: dossier was due on 14 March 2020')
      })

      it('due date yesterday - short format', () => {
        const formatted = dueDateLabel({
          dueItemLabel,
          dueIsoDateTime: yesterday,
          shortFormat: true,
          includeTime: false,
        })
        expect(formatted).toEqual('Yesterday')
      })

      it('due date before yesterday - short format', () => {
        const formatted = dueDateLabel({
          dueItemLabel,
          dueIsoDateTime: dayBeforeYesterday,
          shortFormat: true,
          includeTime: false,
        })
        expect(formatted).toEqual('13 Mar')
      })

      it('due date tomorrow shows tomorrow', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: tomorrow, includeTime: false })
        expect(formatted).toEqual('Dossier due tomorrow')
      })

      it('due date tomorrow shows tomorrow - short format', () => {
        const formatted = dueDateLabel({
          dueItemLabel,
          dueIsoDateTime: tomorrow,
          includeTime: false,
          shortFormat: true,
        })
        expect(formatted).toEqual('Tomorrow')
      })

      it('due date after tomorrow shows date', () => {
        const formatted = dueDateLabel({ dueItemLabel, dueIsoDateTime: dayAfterTomorrow, includeTime: false })
        expect(formatted).toEqual('Dossier will be due on 17 March 2020')
      })

      it('due date after tomorrow shows date - short format', () => {
        const formatted = dueDateLabel({
          dueItemLabel,
          dueIsoDateTime: dayAfterTomorrow,
          includeTime: false,
          shortFormat: true,
        })
        expect(formatted).toEqual('17 Mar')
      })
    })
    function asUtcDateTime(isoDateTimeStr: string) {
      return DateTime.fromISO(isoDateTimeStr, { zone: 'utc' })
    }
  })

  describe('sortListByDateField', () => {
    it('sorts by a deeply nested key, oldest first', () => {
      const list = [{ a: { b: { c: '2021-10-03' } } }, { a: { b: { c: '2021-10-02' } } }]
      const sorted = sortListByDateField({ list, dateKey: 'a.b.c', newestFirst: false })
      expect(sorted).toEqual([{ a: { b: { c: '2021-10-02' } } }, { a: { b: { c: '2021-10-03' } } }])
    })

    it('sorts by a deeply nested key, newest first', () => {
      const list = [
        { a: { b: { c: '2021-02-13' } } },
        { a: { b: { c: '2021-08-22' } } },
        { a: { b: { c: '2022-02-11' } } },
      ]
      const sorted = sortListByDateField({ list, dateKey: 'a.b.c', newestFirst: true })
      expect(sorted).toEqual([
        { a: { b: { c: '2022-02-11' } } },
        { a: { b: { c: '2021-08-22' } } },
        { a: { b: { c: '2021-02-13' } } },
      ])
    })
  })
})
