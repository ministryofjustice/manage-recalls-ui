import { DateTime } from 'luxon'
import { validateReturnToCustodyDates } from './validateReturnToCustodyDates'
import { padWithZeroes } from '../../utils/dates/format'

describe('validateReturnToCustodyDates', () => {
  it('returns valuesToSave with corrected times if in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      returnedToCustodyDateTimeDay: '10',
      returnedToCustodyDateTimeMonth: '05',
      returnedToCustodyDateTimeYear: '2021',
      returnedToCustodyDateTimeHour: '05',
      returnedToCustodyDateTimeMinute: '03',
      returnedToCustodyNotificationDateTimeDay: '15',
      returnedToCustodyNotificationDateTimeMonth: '07',
      returnedToCustodyNotificationDateTimeYear: '2020',
      returnedToCustodyNotificationDateTimeHour: '15',
      returnedToCustodyNotificationDateTimeMinute: '45',
    }
    const { errors, valuesToSave, redirectToPage } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      returnedToCustodyDateTime: '2021-05-10T04:03:00.000Z',
      returnedToCustodyNotificationDateTime: '2020-07-15T14:45:00.000Z',
    })
    expect(redirectToPage).toEqual('/')
  })

  it('returns valuesToSave with an uncorrected time if not in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      returnedToCustodyDateTimeDay: '23',
      returnedToCustodyDateTimeMonth: '12',
      returnedToCustodyDateTimeYear: '2019',
      returnedToCustodyDateTimeHour: '04',
      returnedToCustodyDateTimeMinute: '23',
      returnedToCustodyNotificationDateTimeDay: '15',
      returnedToCustodyNotificationDateTimeMonth: '12',
      returnedToCustodyNotificationDateTimeYear: '2020',
      returnedToCustodyNotificationDateTimeHour: '15',
      returnedToCustodyNotificationDateTimeMinute: '45',
    }
    const { errors, valuesToSave } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      returnedToCustodyDateTime: '2019-12-23T04:23:00.000Z',
      returnedToCustodyNotificationDateTime: '2020-12-15T15:45:00.000Z',
    })
  })

  it('returns an error if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      returnedToCustodyDateTimeParts: {},
      returnedToCustodyNotificationDateTimeParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#returnedToCustodyDateTime-returnedToCustodyDateTimeDay',
        name: 'returnedToCustodyDateTime',
        text: 'Enter the date and time {{ recall.fullName }} returned to custody',
        values: {},
      },
      {
        href: '#returnedToCustodyNotificationDateTime-returnedToCustodyNotificationDateTimeDay',
        name: 'returnedToCustodyNotificationDateTime-returnedToCustodyNotificationDateTimeDay',
        text: 'Enter the date and time you found out {{ recall.fullName }} returned to custody',
        values: {},
      },
    ])
  })

  it('returns an error if part of the date is missing, and unsavedValues, but no valuesToSave', () => {
    const requestBody = {
      returnedToCustodyDateTimeDay: '23',
      returnedToCustodyDateTimeMonth: '',
      returnedToCustodyDateTimeYear: '2019',
      returnedToCustodyDateTimeHour: '',
      returnedToCustodyDateTimeMinute: '23',
      returnedToCustodyNotificationDateTimeDay: '',
      returnedToCustodyNotificationDateTimeMonth: '12',
      returnedToCustodyNotificationDateTimeYear: '',
      returnedToCustodyNotificationDateTimeHour: '15',
      returnedToCustodyNotificationDateTimeMinute: '',
    }
    const { errors, valuesToSave, unsavedValues } = validateReturnToCustodyDates({
      requestBody,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      returnedToCustodyDateTimeParts: {
        day: '23',
        hour: '',
        minute: '23',
        month: '',
        year: '2019',
      },
      returnedToCustodyNotificationDateTimeParts: {
        day: '',
        hour: '15',
        minute: '',
        month: '12',
        year: '',
      },
    })
    expect(errors).toEqual([
      {
        href: '#returnedToCustodyDateTime-returnedToCustodyDateTimeDay',
        name: 'returnedToCustodyDateTime',
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
        href: '#returnedToCustodyNotificationDateTime-returnedToCustodyNotificationDateTimeDay',
        name: 'returnedToCustodyNotificationDateTime',
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
      returnedToCustodyDateTimeDay: padWithZeroes(day),
      returnedToCustodyDateTimeMonth: padWithZeroes(month),
      returnedToCustodyDateTimeYear: year.toString(),
      returnedToCustodyDateTimeHour: padWithZeroes(hour),
      returnedToCustodyDateTimeMinute: padWithZeroes(minute),
      returnedToCustodyNotificationDateTimeDay: padWithZeroes(day),
      returnedToCustodyNotificationDateTimeMonth: padWithZeroes(month),
      returnedToCustodyNotificationDateTimeYear: year.toString(),
      returnedToCustodyNotificationDateTimeHour: padWithZeroes(hour),
      returnedToCustodyNotificationDateTimeMinute: padWithZeroes(minute),
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
      returnedToCustodyDateTimeDay: '12',
      returnedToCustodyDateTimeMonth: '13',
      returnedToCustodyDateTimeYear: '2021',
      returnedToCustodyDateTimeHour: '10',
      returnedToCustodyDateTimeMinute: '14',
      returnedToCustodyNotificationDateTimeDay: '35',
      returnedToCustodyNotificationDateTimeMonth: '11',
      returnedToCustodyNotificationDateTimeYear: '2021',
      returnedToCustodyNotificationDateTimeHour: '10',
      returnedToCustodyNotificationDateTimeMinute: '14',
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
      returnedToCustodyDateTimeDay: '12',
      returnedToCustodyDateTimeMonth: '09',
      returnedToCustodyDateTimeYear: '2021',
      returnedToCustodyDateTimeHour: '24',
      returnedToCustodyDateTimeMinute: '14',
      returnedToCustodyNotificationDateTimeDay: '21',
      returnedToCustodyNotificationDateTimeMonth: '11',
      returnedToCustodyNotificationDateTimeYear: '2021',
      returnedToCustodyNotificationDateTimeHour: '10',
      returnedToCustodyNotificationDateTimeMinute: '67',
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
