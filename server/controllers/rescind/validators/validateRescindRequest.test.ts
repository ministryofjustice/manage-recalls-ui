import { DateTime } from 'luxon'
import { validateRescindRequest } from './validateRescindRequest'
import { padWithZeroes } from '../../utils/dates/format'
import * as uploadHelpers from '../../documents/upload/helpers'

describe('validateRescindRequest', () => {
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns valuesToSave with a date, a confirmation message, and no errors if all fields are submitted', () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '23',
      rescindRequestEmailReceivedDateMonth: '12',
      rescindRequestEmailReceivedDateYear: '2019',
      rescindRequestDetail: 'Details..',
    }
    const { errors, valuesToSave, confirmationMessage } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      details: 'Details..',
      emailReceivedDate: '2019-12-23',
    })
    expect(confirmationMessage).toEqual({
      link: {
        href: '#rescinds',
        text: 'View',
      },
      text: 'Rescind request added.',
      type: 'success',
    })
  })

  it('returns errors if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      rescindRequestEmailReceivedDateParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#rescindRequestDetail',
        name: 'rescindRequestDetail',
        text: 'Provide more detail',
      },
      {
        href: '#rescindRequestEmailReceivedDate-rescindRequestEmailReceivedDateDay',
        name: 'rescindRequestEmailReceivedDate',
        text: 'Enter the date you received the rescind request email',
        values: {},
      },
    ])
  })

  it('returns an error if part of the date is missing, and unsavedValues, but no valuesToSave', () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '23',
      rescindRequestEmailReceivedDateMonth: '',
      rescindRequestEmailReceivedDateYear: '2019',
      rescindRequestDetail: 'Details..',
    }
    const { errors, valuesToSave, unsavedValues } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      rescindRequestDetail: 'Details..',
      rescindRequestEmailReceivedDateParts: {
        day: '23',
        month: '',
        year: '2019',
      },
    })
    expect(errors).toEqual([
      {
        href: '#rescindRequestEmailReceivedDate-rescindRequestEmailReceivedDateDay',
        name: 'rescindRequestEmailReceivedDate',
        text: 'The date you received the rescind request email must include a month',
        values: {
          day: '23',
          month: '',
          year: '2019',
        },
      },
    ])
  })

  it('returns an error if the date is not in the past', () => {
    const { year, month, day } = DateTime.now().plus({ days: 1 })
    const requestBody = {
      rescindRequestEmailReceivedDateDay: padWithZeroes(day),
      rescindRequestEmailReceivedDateMonth: padWithZeroes(month),
      rescindRequestEmailReceivedDateYear: year.toString(),
      rescindRequestDetail: 'Details..',
    }
    const { errors } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The date you received the rescind request email must be today or in the past')
  })

  it('returns an error if the date is invalid', () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '12',
      rescindRequestEmailReceivedDateMonth: '13',
      rescindRequestEmailReceivedDateYear: '2021',
      rescindRequestDetail: 'Details..',
    }
    const { errors } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The date you received the rescind request email must be a real date')
  })

  it("returns an error if an email wasn't uploaded", () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '12',
      rescindRequestEmailReceivedDateMonth: '09',
      rescindRequestEmailReceivedDateYear: '2021',
      rescindRequestDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindRequest({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindRequestEmailFileName',
        name: 'rescindRequestEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '12',
      rescindRequestEmailReceivedDateMonth: '09',
      rescindRequestEmailReceivedDateYear: '2021',
      rescindRequestDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindRequestEmailFileName',
        name: 'rescindRequestEmailFileName',
        text: 'The selected file could not be uploaded ??? try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '12',
      rescindRequestEmailReceivedDateMonth: '09',
      rescindRequestEmailReceivedDateYear: '2021',
      rescindRequestDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindRequest({
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
        href: '#rescindRequestEmailFileName',
        name: 'rescindRequestEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the email was too large', () => {
    const requestBody = {
      rescindRequestEmailReceivedDateDay: '12',
      rescindRequestEmailReceivedDateMonth: '09',
      rescindRequestEmailReceivedDateYear: '2021',
      rescindRequestDetail: 'Details..',
    }
    jest.spyOn(uploadHelpers, 'isFileSizeTooLarge').mockReturnValue(true)
    const { errors, valuesToSave } = validateRescindRequest({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindRequestEmailFileName',
        name: 'rescindRequestEmailFileName',
        text: "The selected file 'test.msg' must be smaller than 25MB",
      },
    ])
  })
})
