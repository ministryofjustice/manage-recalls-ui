import { DateTime } from 'luxon'
import { validateReturnToCustodyDates } from './validateReturnToCustodyDates'
import { padWithZeroes } from '../../helpers/dates/format'

describe('validateReturnToCustodyDates', () => {
  it('returns valuesToSave with corrected times if in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      returnToCustodyDateTimeDay: '10',
      returnToCustodyDateTimeMonth: '05',
      returnToCustodyDateTimeYear: '2021',
      returnToCustodyDateTimeHour: '05',
      returnToCustodyDateTimeMinute: '03',
      returnToCustodyNotificationDateTimeDay: '15',
      returnToCustodyNotificationDateTimeMonth: '07',
      returnToCustodyNotificationDateTimeYear: '2020',
      returnToCustodyNotificationDateTimeHour: '15',
      returnToCustodyNotificationDateTimeMinute: '45',
    }
    const { errors, valuesToSave, redirectToPage } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      returnToCustodyDateTime: '2021-05-10T04:03:00.000Z',
      returnToCustodyNotificationDateTime: '2020-07-15T14:45:00.000Z',
    })
    expect(redirectToPage).toEqual('/')
  })

  it('returns valuesToSave with an uncorrected time if not in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      returnToCustodyDateTimeDay: '23',
      returnToCustodyDateTimeMonth: '12',
      returnToCustodyDateTimeYear: '2019',
      returnToCustodyDateTimeHour: '04',
      returnToCustodyDateTimeMinute: '23',
      returnToCustodyNotificationDateTimeDay: '15',
      returnToCustodyNotificationDateTimeMonth: '12',
      returnToCustodyNotificationDateTimeYear: '2020',
      returnToCustodyNotificationDateTimeHour: '15',
      returnToCustodyNotificationDateTimeMinute: '45',
    }
    const { errors, valuesToSave } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      returnToCustodyDateTime: '2019-12-23T04:23:00.000Z',
      returnToCustodyNotificationDateTime: '2020-12-15T15:45:00.000Z',
    })
  })

  it('returns an error if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      returnToCustodyDateTimeParts: {},
      returnToCustodyNotificationDateTimeParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#returnToCustodyDateTime',
        name: 'returnToCustodyDateTime',
        text: 'Enter the date and time {{ recall.fullName }} returned to custody',
        values: {},
      },
      {
        href: '#returnToCustodyNotificationDateTime',
        name: 'returnToCustodyNotificationDateTime',
        text: 'Enter the date and time you found out {{ recall.fullName }} returned to custody',
        values: {},
      },
    ])
  })

  it('returns an error if part of the date is missing, and unsavedValues, but no valuesToSave', () => {
    const requestBody = {
      returnToCustodyDateTimeDay: '23',
      returnToCustodyDateTimeMonth: '',
      returnToCustodyDateTimeYear: '2019',
      returnToCustodyDateTimeHour: '',
      returnToCustodyDateTimeMinute: '23',
      returnToCustodyNotificationDateTimeDay: '',
      returnToCustodyNotificationDateTimeMonth: '12',
      returnToCustodyNotificationDateTimeYear: '',
      returnToCustodyNotificationDateTimeHour: '15',
      returnToCustodyNotificationDateTimeMinute: '',
    }
    const { errors, valuesToSave, unsavedValues } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      returnToCustodyDateTimeParts: {
        day: '23',
        hour: '',
        minute: '23',
        month: '',
        year: '2019',
      },
      returnToCustodyNotificationDateTimeParts: {
        day: '',
        hour: '15',
        minute: '',
        month: '12',
        year: '',
      },
    })
    expect(errors).toEqual([
      {
        href: '#returnToCustodyDateTime',
        name: 'returnToCustodyDateTime',
        text: 'The date and time {{ recall.fullName }} returned to custody must include a month and hour',
        values: {
          day: '23',
          hour: '',
          minute: '23',
          month: '',
          year: '2019',
        },
      },
      {
        href: '#returnToCustodyNotificationDateTime',
        name: 'returnToCustodyNotificationDateTime',
        text: 'The date and time you found out {{ recall.fullName }} returned to custody must include a day, year and minute',
        values: {
          day: '',
          hour: '15',
          minute: '',
          month: '12',
          year: '',
        },
      },
    ])
  })

  it('returns an error if the date-time is not in the past', () => {
    const { year, month, day, hour, minute } = DateTime.now().plus({ hours: 2 })
    const requestBody = {
      returnToCustodyDateTimeDay: padWithZeroes(day),
      returnToCustodyDateTimeMonth: padWithZeroes(month),
      returnToCustodyDateTimeYear: year.toString(),
      returnToCustodyDateTimeHour: padWithZeroes(hour),
      returnToCustodyDateTimeMinute: padWithZeroes(minute),
      returnToCustodyNotificationDateTimeDay: padWithZeroes(day),
      returnToCustodyNotificationDateTimeMonth: padWithZeroes(month),
      returnToCustodyNotificationDateTimeYear: year.toString(),
      returnToCustodyNotificationDateTimeHour: padWithZeroes(hour),
      returnToCustodyNotificationDateTimeMinute: padWithZeroes(minute),
    }
    const { errors } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors[0].text).toEqual(
      'The date and time {{ recall.fullName }} returned to custody must be today or in the past'
    )
    expect(errors[1].text).toEqual(
      'The date and time you found out {{ recall.fullName }} returned to custody must be today or in the past'
    )
  })

  it('returns an error if the date is invalid', () => {
    const requestBody = {
      returnToCustodyDateTimeDay: '12',
      returnToCustodyDateTimeMonth: '13',
      returnToCustodyDateTimeYear: '2021',
      returnToCustodyDateTimeHour: '10',
      returnToCustodyDateTimeMinute: '14',
      returnToCustodyNotificationDateTimeDay: '35',
      returnToCustodyNotificationDateTimeMonth: '11',
      returnToCustodyNotificationDateTimeYear: '2021',
      returnToCustodyNotificationDateTimeHour: '10',
      returnToCustodyNotificationDateTimeMinute: '14',
    }
    const { errors } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors[0].text).toEqual('The date and time {{ recall.fullName }} returned to custody must be a real date')
    expect(errors[1].text).toEqual(
      'The date and time you found out {{ recall.fullName }} returned to custody must be a real date'
    )
  })

  it('returns an error if the time is invalid', () => {
    const requestBody = {
      returnToCustodyDateTimeDay: '12',
      returnToCustodyDateTimeMonth: '09',
      returnToCustodyDateTimeYear: '2021',
      returnToCustodyDateTimeHour: '24',
      returnToCustodyDateTimeMinute: '14',
      returnToCustodyNotificationDateTimeDay: '21',
      returnToCustodyNotificationDateTimeMonth: '11',
      returnToCustodyNotificationDateTimeYear: '2021',
      returnToCustodyNotificationDateTimeHour: '10',
      returnToCustodyNotificationDateTimeMinute: '67',
    }
    const { errors } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors[0].text).toEqual('The date and time {{ recall.fullName }} returned to custody must be a real time')
    expect(errors[1].text).toEqual(
      'The date and time you found out {{ recall.fullName }} returned to custody must be a real time'
    )
  })
})
