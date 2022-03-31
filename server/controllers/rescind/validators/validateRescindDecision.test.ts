import { DateTime } from 'luxon'
import { validateRescindDecision } from './validateRescindDecision'
import { padWithZeroes } from '../../utils/dates/format'
import * as uploadHelpers from '../../documents/upload/helpers'

describe('validateRescindDecision', () => {
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns valuesToSave with a date, confirmation message and no errors if all fields are submitted', () => {
    const requestBody = {
      rescindRecordId: '1234',
      approveRescindDecision: 'YES',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '23',
      rescindDecisionEmailSentDateMonth: '12',
      rescindDecisionEmailSentDateYear: '2019',
      rescindDecisionDetail: 'Details..',
    }
    const { errors, valuesToSave, confirmationMessage } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      rescindRecordId: '1234',
      approved: true,
      details: 'Details..',
      emailSentDate: '2019-12-23',
    })
    expect(confirmationMessage).toEqual({
      link: {
        href: '#rescinds',
        text: 'View',
      },
      text: 'Recall rescinded.',
      type: 'success',
    })
  })

  it('returns errors if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      rescindDecisionEmailSentDateParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#approveRescindDecision',
        name: 'approveRescindDecision',
        text: 'Do you want to rescind this recall?',
      },
      {
        href: '#rescindDecisionDetail',
        name: 'rescindDecisionDetail',
        text: 'Provide more detail',
      },
      {
        href: '#confirmEmailSent',
        name: 'confirmEmailSent',
        text: "Confirm you've sent the email to all recipients",
      },
    ])
  })

  it('returns an error if part of the date is missing, and unsavedValues, but no valuesToSave', () => {
    const requestBody = {
      approveRescindDecision: 'YES',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '23',
      rescindDecisionEmailSentDateMonth: '',
      rescindDecisionEmailSentDateYear: '2019',
      rescindDecisionDetail: 'Details..',
    }
    const { errors, valuesToSave, unsavedValues } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      approveRescindDecision: 'YES',
      confirmEmailSent: 'YES',
      rescindDecisionDetail: 'Details..',
      rescindDecisionEmailSentDateParts: {
        day: '23',
        month: '',
        year: '2019',
      },
    })
    expect(errors).toEqual([
      {
        href: '#rescindDecisionEmailSentDate-rescindDecisionEmailSentDateDay',
        name: 'rescindDecisionEmailSentDate',
        text: 'The date you sent the rescind decision email must include a month',
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
      approveRescindDecision: 'NO',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: padWithZeroes(day),
      rescindDecisionEmailSentDateMonth: padWithZeroes(month),
      rescindDecisionEmailSentDateYear: year.toString(),
      rescindDecisionDetail: 'Details..',
    }
    const { errors } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The date you sent the rescind decision email must be today or in the past')
  })

  it('returns an error if the date is invalid', () => {
    const requestBody = {
      approveRescindDecision: 'NO',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '12',
      rescindDecisionEmailSentDateMonth: '13',
      rescindDecisionEmailSentDateYear: '2021',
      rescindDecisionDetail: 'Details..',
    }
    const { errors } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors[0].text).toEqual('The date you sent the rescind decision email must be a real date')
  })

  it("returns an error if an email wasn't uploaded", () => {
    const requestBody = {
      approveRescindDecision: 'NO',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '12',
      rescindDecisionEmailSentDateMonth: '09',
      rescindDecisionEmailSentDateYear: '2021',
      rescindDecisionDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindDecision({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindDecisionEmailFileName',
        name: 'rescindDecisionEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const requestBody = {
      approveRescindDecision: 'NO',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '12',
      rescindDecisionEmailSentDateMonth: '09',
      rescindDecisionEmailSentDateYear: '2021',
      rescindDecisionDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindDecisionEmailFileName',
        name: 'rescindDecisionEmailFileName',
        text: 'The selected file could not be uploaded – try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const requestBody = {
      approveRescindDecision: 'NO',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '12',
      rescindDecisionEmailSentDateMonth: '09',
      rescindDecisionEmailSentDateYear: '2021',
      rescindDecisionDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindDecision({
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
        href: '#rescindDecisionEmailFileName',
        name: 'rescindDecisionEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the email was too large', () => {
    const requestBody = {
      approveRescindDecision: 'NO',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '12',
      rescindDecisionEmailSentDateMonth: '09',
      rescindDecisionEmailSentDateYear: '2021',
      rescindDecisionDetail: 'Details..',
    }
    jest.spyOn(uploadHelpers, 'isFileSizeTooLarge').mockReturnValue(true)
    const { errors, valuesToSave } = validateRescindDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindDecisionEmailFileName',
        name: 'rescindDecisionEmailFileName',
        text: "The selected file 'test.msg' must be smaller than 25MB",
      },
    ])
  })
})
