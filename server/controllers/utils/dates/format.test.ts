import { DateTime, Duration } from 'luxon'
import { dueDateShortLabel, formatDateTimeFromIsoString, dueDateTimeLabel } from './format'

describe('Date helpers', () => {
  describe('formatDateTimeFromIsoString', () => {
    it('formats a date', () => {
      const formatted = formatDateTimeFromIsoString({ isoDate: '2021-11-12' })
      expect(formatted).toEqual('12 November 2021')
    })

    it('formats a date-time, adjusted if inside daylight saving', () => {
      const formatted = formatDateTimeFromIsoString({ isoDate: '2021-06-22T08:43:00.000Z' })
      expect(formatted).toEqual('22 June 2021 at 09:43')
    })

    it('formats a date-time, not adjusted if outside daylight saving', () => {
      const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T08:43:00.000Z' })
      expect(formatted).toEqual('22 December 2021 at 08:43')
    })

    it('outputs a date-time in short format', () => {
      const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T08:43:00.000Z', shortDateFormat: true })
      expect(formatted).toEqual('22 Dec at 08:43')
    })

    it('formats a date-time as a date if dateOnly param is true', () => {
      const formatted = formatDateTimeFromIsoString({ isoDate: '2021-12-22T08:43:00.000Z', dateOnly: true })
      expect(formatted).toEqual('22 December 2021')
    })

    it('formats date only in short format', () => {
      const formatted = formatDateTimeFromIsoString({
        isoDate: '2021-12-22T08:43:00.000Z',
        dateOnly: true,
        shortDateFormat: true,
      })
      expect(formatted).toEqual('22 Dec')
    })
  })

  describe('dueDateShortLabel', () => {
    it('from valid overdue due date returns correct overdue message', () => {
      const formatted = dueDateShortLabel('2021-06-22T08:43:00.000Z')
      expect(formatted).toEqual('Overdue: Due on 22 June 2021')
    })

    it("doesn't show a due date of today as overdue", () => {
      const date = DateTime.now().toString()
      const formatted = dueDateShortLabel(date)
      expect(formatted).toEqual(`Due on ${formatDateTimeFromIsoString({ isoDate: date, dateOnly: true })}`)
    })

    it('from valid not overdue due date returns correct message', () => {
      const date = DateTime.now()
        .plus(Duration.fromObject({ days: 1 }))
        .toString()
      const formatted = dueDateShortLabel(date)
      expect(formatted).toEqual(`Due on ${formatDateTimeFromIsoString({ isoDate: date, dateOnly: true })}`)
    })

    it('of undefined returns undefined', () => {
      const formatted = dueDateShortLabel(undefined)
      expect(formatted).toBeUndefined()
    })

    it('of invalid returns undefined', () => {
      const formatted = dueDateShortLabel('not an iso date string')
      expect(formatted).toBeUndefined()
    })
  })

  describe('dueDateLabel', () => {
    let dateNowSpy: jest.SpyInstance

    afterAll(() => {
      // Unlock Time
      dateNowSpy.mockRestore()
    })

    describe('dueDateTimeLabel all variants in BST one hour ahead of UTC', () => {
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
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: laterToday })
        expect(formatted).toEqual('Recall assessment due today by 16:15')
      })

      it('due date later today shows today by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: laterToday, shortFormat: true })
        expect(formatted).toEqual('Today at 16:15')
      })

      it('due date tomorrow shows tomorrow by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: tomorrow })
        expect(formatted).toEqual('Recall assessment due tomorrow by 12:10')
      })

      it('due date tomorrow shows tomorrow by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: tomorrow, shortFormat: true })
        expect(formatted).toEqual('Tomorrow at 12:10')
      })

      it('due date yesterday shows overdue, date by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: yesterday })
        expect(formatted).toEqual('Overdue: Recall assessment was due on 14 July 2020 by 17:10')
      })

      it('due date yesterday shows overdue, date by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: yesterday, shortFormat: true })
        expect(formatted).toEqual('Yesterday at 17:10')
      })

      it('due date earlier today shows overdue today by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: earlierToday })
        expect(formatted).toEqual('Overdue: Recall assessment was due today by 16:05')
      })

      it('due date earlier today shows overdue today by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: earlierToday, shortFormat: true })
        expect(formatted).toEqual('Today at 16:05')
      })

      it('due date precisely now shows overdue today by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: fixedNow })
        expect(formatted).toEqual('Overdue: Recall assessment was due today by 16:10')
      })

      it('due date precisely now shows overdue today by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: fixedNow, shortFormat: true })
        expect(formatted).toEqual('Today at 16:10')
      })

      it('due date after tomorrow shows due on date by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: afterTomorrow })
        expect(formatted).toEqual('Recall assessment will be due on 17 July 2020 by 11:10')
      })

      it('due date after tomorrow shows due on date by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: afterTomorrow, shortFormat: true })
        expect(formatted).toEqual('17 Jul at 11:10')
      })
    })

    describe('dueDateTimeLabel example outside of BST hence same as UTC', () => {
      const dueItemLabel = 'Recall assessment'
      const fixedNow = '2020-03-15T15:10:00.000Z'
      const laterToday = '2020-03-15T15:15:00.000Z'
      const earlierToday = '2020-03-15T15:05:00.000Z'

      beforeAll(() => {
        // Lock Time
        dateNowSpy = jest.spyOn(DateTime, 'now').mockReturnValue(asUtcDateTime(fixedNow))
      })

      it('due date later today shows today by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: laterToday })
        expect(formatted).toEqual('Recall assessment due today by 15:15')
      })

      it('due date later today shows today by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: laterToday, shortFormat: true })
        expect(formatted).toEqual('Today at 15:15')
      })

      it('due date earlier today shows overdue today by time of day', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: earlierToday })
        expect(formatted).toEqual('Overdue: Recall assessment was due today by 15:05')
      })

      it('due date earlier today shows overdue today by time of day - short format', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: earlierToday, shortFormat: true })
        expect(formatted).toEqual('Today at 15:05')
      })
    })

    describe('dueDateTimeLabel for date only, no time', () => {
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
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: fixedNow, includeTime: false })
        expect(formatted).toEqual('Dossier due today')
      })

      it('due date today shows today - short format', () => {
        const formatted = dueDateTimeLabel({
          dueItemLabel,
          dueIsoDateTime: fixedNow,
          shortFormat: true,
          includeTime: false,
        })
        expect(formatted).toEqual('Today')
      })

      it('due date yesterday shows overdue', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: yesterday, includeTime: false })
        expect(formatted).toEqual('Overdue: Dossier was due on 14 March 2020')
      })

      it('due date yesterday - short format', () => {
        const formatted = dueDateTimeLabel({
          dueItemLabel,
          dueIsoDateTime: yesterday,
          shortFormat: true,
          includeTime: false,
        })
        expect(formatted).toEqual('Yesterday')
      })

      it('due date yesterday - short format with showOverdueForShortFormat = true', () => {
        const formatted = dueDateTimeLabel({
          dueItemLabel,
          dueIsoDateTime: yesterday,
          shortFormat: true,
          includeTime: false,
          showOverdueForShortFormat: true,
        })
        expect(formatted).toEqual('Overdue')
      })

      it('due date before yesterday - short format', () => {
        const formatted = dueDateTimeLabel({
          dueItemLabel,
          dueIsoDateTime: dayBeforeYesterday,
          shortFormat: true,
          includeTime: false,
        })
        expect(formatted).toEqual('13 Mar')
      })

      it('due date tomorrow shows tomorrow', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: tomorrow, includeTime: false })
        expect(formatted).toEqual('Dossier due tomorrow')
      })

      it('due date tomorrow shows tomorrow - short format', () => {
        const formatted = dueDateTimeLabel({
          dueItemLabel,
          dueIsoDateTime: tomorrow,
          includeTime: false,
          shortFormat: true,
        })
        expect(formatted).toEqual('Tomorrow')
      })

      it('due date after tomorrow shows date', () => {
        const formatted = dueDateTimeLabel({ dueItemLabel, dueIsoDateTime: dayAfterTomorrow, includeTime: false })
        expect(formatted).toEqual('Dossier will be due on 17 March 2020')
      })

      it('due date after tomorrow shows date - short format', () => {
        const formatted = dueDateTimeLabel({
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
})
