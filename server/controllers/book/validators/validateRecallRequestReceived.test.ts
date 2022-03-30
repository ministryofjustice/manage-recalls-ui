import { DateTime } from 'luxon'
import { validateRecallRequestReceived } from './validateRecallRequestReceived'
import { padWithZeroes } from '../../utils/dates/format'
import * as uploadHelpers from '../../documents/upload/helpers'

describe('validateRecallRequestReceived', () => {
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns valuesToSave with a corrected time if in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '10',
      recallEmailReceivedDateTimeMonth: '05',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '05',
      recallEmailReceivedDateTimeMinute: '03',
    }
    const { errors, valuesToSave, redirectToPage } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallEmailReceivedDateTime: '2021-05-10T04:03:00.000Z',
    })
    expect(redirectToPage).toEqual('last-release')
  })

  it('returns valuesToSave with an uncorrected time if not in daylight-saving period, and no errors if all fields are submitted', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '23',
      recallEmailReceivedDateTimeMonth: '12',
      recallEmailReceivedDateTimeYear: '2019',
      recallEmailReceivedDateTimeHour: '04',
      recallEmailReceivedDateTimeMinute: '23',
    }
    const { errors, valuesToSave } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallEmailReceivedDateTime: '2019-12-23T04:23:00.000Z',
    })
  })

  it("returns valuesToSave if an email wasn't uploaded, but there is an existing upload", () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '09',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '22',
      recallEmailReceivedDateTimeMinute: '14',
      RECALL_REQUEST_EMAIL: 'existingUpload',
    }
    const { errors, valuesToSave } = validateRecallRequestReceived({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({
      recallEmailReceivedDateTime: '2021-09-12T21:14:00.000Z',
    })
    expect(errors).toBeUndefined()
  })

  it('returns an error if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      recallEmailReceivedDateTimeParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#recallEmailReceivedDateTime-recallEmailReceivedDateTimeDay',
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
    const { errors, valuesToSave, unsavedValues } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
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
        href: '#recallEmailReceivedDateTime-recallEmailReceivedDateTimeDay',
        name: 'recallEmailReceivedDateTime',
        text: 'The date and time you received the recall email must include a month and hour',
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

  it('returns an error if the date-time is not in the past', () => {
    const { year, month, day, hour, minute } = DateTime.now().plus({ hours: 2 })
    const requestBody = {
      recallEmailReceivedDateTimeDay: padWithZeroes(day),
      recallEmailReceivedDateTimeMonth: padWithZeroes(month),
      recallEmailReceivedDateTimeYear: year.toString(),
      recallEmailReceivedDateTimeHour: padWithZeroes(hour),
      recallEmailReceivedDateTimeMinute: padWithZeroes(minute),
    }
    const { errors } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The time you received the recall email must be today or in the past')
  })

  it('returns an error if the date is invalid', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '13',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '10',
      recallEmailReceivedDateTimeMinute: '14',
    }
    const { errors } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The date you received the recall email must be a real date')
  })

  it('returns an error if the time is invalid', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '09',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '24',
      recallEmailReceivedDateTimeMinute: '14',
    }
    const { errors } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The time you received the recall email must be a real time')
  })

  it("returns an error and unsaved values if an email wasn't uploaded", () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '09',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '22',
      recallEmailReceivedDateTimeMinute: '14',
    }
    const { errors, unsavedValues, valuesToSave } = validateRecallRequestReceived({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      recallEmailReceivedDateTimeParts: {
        day: '12',
        hour: '22',
        minute: '14',
        month: '09',
        year: '2021',
      },
    })
    expect(errors).toEqual([
      {
        href: '#recallRequestEmailFileName',
        name: 'recallRequestEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '09',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '22',
      recallEmailReceivedDateTimeMinute: '14',
    }
    const { errors, valuesToSave } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallRequestEmailFileName',
        name: 'recallRequestEmailFileName',
        text: 'The selected file could not be uploaded – try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '09',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '22',
      recallEmailReceivedDateTimeMinute: '14',
    }
    const { errors, valuesToSave } = validateRecallRequestReceived({
      requestBody,
      file: {
        ...file,
        originalname: 'email.pdf',
        mimetype: 'application/pdf',
      },
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallRequestEmailFileName',
        name: 'recallRequestEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the email was too large', () => {
    const requestBody = {
      recallEmailReceivedDateTimeDay: '12',
      recallEmailReceivedDateTimeMonth: '09',
      recallEmailReceivedDateTimeYear: '2021',
      recallEmailReceivedDateTimeHour: '22',
      recallEmailReceivedDateTimeMinute: '14',
    }
    jest.spyOn(uploadHelpers, 'isFileSizeTooLarge').mockReturnValue(true)
    const { errors, valuesToSave } = validateRecallRequestReceived({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallRequestEmailFileName',
        name: 'recallRequestEmailFileName',
        text: "The selected file 'test.msg' must be smaller than 25MB",
      },
    ])
  })
})
