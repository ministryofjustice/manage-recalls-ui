import { validateRecallRequestReceived } from './validateRecallRequestReceived'

describe('validateRecallRequestReceived', () => {
  it('returns valuesToSave with a corrected time if in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '10',
      recallEmailReceivedDateTimeMonth: '05',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '05',
      recallEmailReceivedDateTimeMinute: '3',
    }
    const { errors, valuesToSave } = validateRecallRequestReceived(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallEmailReceivedDateTime: '2021-05-10T04:03:00.000Z',
    })
  })

  it('returns valuesToSave with an uncorrected time if not in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '23',
      recallEmailReceivedDateTimeMonth: '12',
      recallEmailReceivedDateTimeYear: '2019',
      recallEmailReceivedDateTimeHour: '4',
      recallEmailReceivedDateTimeMinute: '23',
    }
    const { errors, valuesToSave } = validateRecallRequestReceived(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallEmailReceivedDateTime: '2019-12-23T04:23:00.000Z',
    })
  })

  it('returns an error if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateRecallRequestReceived(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      recallEmailReceivedDateTimeParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#recallEmailReceivedDateTime',
        name: 'recallEmailReceivedDateTime',
        text: 'Enter the date and time you received the recall email',
        values: {},
      },
    ])
  })

  it('returns an error if part of the date is missing, and unsavedValues, but no valuesToSave', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '23',
      recallEmailReceivedDateTimeMonth: '',
      recallEmailReceivedDateTimeYear: '2019',
      recallEmailReceivedDateTimeHour: '',
      recallEmailReceivedDateTimeMinute: '23',
    }
    const { errors, valuesToSave, unsavedValues } = validateRecallRequestReceived(requestBody)
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      recallEmailReceivedDateTimeParts: {
        day: '23',
        hour: '',
        minute: '23',
        month: '',
        year: '2019',
      },
    })
    expect(errors).toEqual([
      {
        href: '#recallEmailReceivedDateTime',
        name: 'recallEmailReceivedDateTime',
        text: 'Enter the date and time you received the recall email',
        values: {
          day: '23',
          hour: '',
          minute: '23',
          month: '',
          year: '2019',
        },
      },
    ])
  })
})
