import { validateRecallNotificationEmail } from './validateRecallNotificationEmail'
import * as uploadHelpers from '../../documents/upload/helpers'

describe('validateEmail', () => {
  const requestBody = {
    confirmRecallNotificationEmailSent: 'YES',
    recallNotificationEmailSentDateTimeYear: '2021',
    recallNotificationEmailSentDateTimeMonth: '09',
    recallNotificationEmailSentDateTimeDay: '04',
    recallNotificationEmailSentDateTimeHour: '14',
    recallNotificationEmailSentDateTimeMinute: '47',
  }
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File
  const actionedByUserId = '00000000-0000-0000-0000-000000000000'

  it('returns valuesToSave for all valid fields and a redirect', () => {
    const { errors, valuesToSave, redirectToPage } = validateRecallNotificationEmail({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallNotificationEmailSentDateTime: '2021-09-04T13:47:00.000Z',
      assessedByUserId: actionedByUserId,
    })
    expect(redirectToPage).toEqual('assess-confirmation')
  })

  it("returns valuesToSave if an email wasn't uploaded, but there is an existing upload", () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody: { ...requestBody, RECALL_NOTIFICATION_EMAIL: 'existingUpload' },
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({
      recallNotificationEmailSentDateTime: '2021-09-04T13:47:00.000Z',
    })
    expect(errors).toBeUndefined()
  })

  it('returns an error for the confirm checkbox only, if no fields submitted', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody: emptyBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmRecallNotificationEmailSent',
        name: 'confirmRecallNotificationEmailSent',
        text: "Confirm you've sent the email to all recipients",
      },
    ])
  })

  it('returns an error for the sent date, if confirm checkbox is checked', () => {
    const body = {
      confirmRecallNotificationEmailSent: 'YES',
    }
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody: body,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailSentDateTime-recallNotificationEmailSentDateTimeDay',
        name: 'recallNotificationEmailSentDateTime',
        text: 'Enter the date and time you sent the email',
        values: {},
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const { errors, unsavedValues, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      file,
      wasUploadFileReceived: false,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      confirmRecallNotificationEmailSent: 'YES',
      recallNotificationEmailFileName: 'test.msg',
      recallNotificationEmailSentDateTimeParts: {
        day: '04',
        hour: '14',
        minute: '47',
        month: '09',
        year: '2021',
      },
    })
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'The selected file could not be uploaded – try again',
        values: 'test.msg',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      file: {
        ...file,
        originalname: 'email.pdf',
        mimetype: 'application/pdf',
      },
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the email was too large', () => {
    jest.spyOn(uploadHelpers, 'isFileSizeTooLarge').mockReturnValue(true)
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: "The selected file 'test.msg' must be smaller than 25MB",
      },
    ])
  })
})
