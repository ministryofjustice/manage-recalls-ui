import { validateRecallNotificationEmail } from './validateRecallNotificationEmail'

describe('validateEmail', () => {
  const requestBody = {
    confirmRecallNotificationEmailSent: 'YES',
    recallNotificationEmailSentDateTimeYear: '2021',
    recallNotificationEmailSentDateTimeMonth: '10',
    recallNotificationEmailSentDateTimeDay: '4',
    recallNotificationEmailSentDateTimeHour: '14',
    recallNotificationEmailSentDateTimeMinute: '47',
  }

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallNotificationEmailSentDateTime: '2021-10-04T13:47:00.000Z',
    })
  })

  it('returns an error for the confirm checkbox only, if no fields submitted', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody: emptyBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmRecallNotificationEmailSent',
        name: 'confirmRecallNotificationEmailSent',
        text: 'Confirm you sent the email to all recipients',
      },
    ])
  })

  it('returns an error for the sent date, if confirm checkbox is checked', () => {
    const body = {
      confirmRecallNotificationEmailSent: 'YES',
    }
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody: body,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailSentDateTime',
        name: 'recallNotificationEmailSentDateTime',
        text: 'Date and time you sent the recall email',
        values: {},
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: false,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'Upload the email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: true,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'An error occurred uploading the email',
        values: 'test.msg',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      fileName: 'test.eml',
      emailFileSelected: true,
      uploadFailed: true,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'An error occurred uploading the email',
        values: 'test.eml',
      },
    ])
  })
})
