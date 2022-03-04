import { DateTime } from 'luxon'
import { validateRescindDecision } from './validateRescindDecision'
import { padWithZeroes } from '../../utils/dates/format'

describe('validateRescindDecision', () => {
  it('returns valuesToSave with a date, and no errors if all fields are submitted', () => {
    const requestBody = {
      approveRescindDecision: 'YES',
      confirmEmailSent: 'YES',
      rescindDecisionEmailSentDateDay: '23',
      rescindDecisionEmailSentDateMonth: '12',
      rescindDecisionEmailSentDateYear: '2019',
      rescindDecisionDetail: 'Details..',
    }
    const { errors, valuesToSave } = validateRescindDecision({
      requestBody,
      fileName: 'test.msg',
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      approved: true,
      details: 'Details..',
      emailSentDate: '2019-12-23',
    })
  })

  it('returns errors if all fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateRescindDecision({
      requestBody,
      fileName: 'test.msg',
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
      fileName: 'test.msg',
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
        href: '#rescindDecisionEmailSentDate',
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
      fileName: 'test.msg',
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
      fileName: 'test.msg',
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
      fileName: 'test.eml',
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
      fileName: 'test.msg',
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
      fileName: 'test.msl',
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#rescindDecisionEmailFileName',
        name: 'rescindDecisionEmailFileName',
        text: 'The selected file must be an MSG or EML',
      },
    ])
  })
})
