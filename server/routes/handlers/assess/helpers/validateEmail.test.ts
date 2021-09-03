import { validateEmail } from './validateEmail'

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
    const { errors, valuesToSave } = validateEmail({
      requestBody,
      fileName: 'test.eml',
      emailFileSelected: true,
      uploadFailed: false,
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
    const { errors, valuesToSave } = validateEmail({
      requestBody: emptyBody,
      fileName: 'test.eml',
      emailFileSelected: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({})
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
    const { errors, valuesToSave } = validateEmail({
      requestBody: body,
      fileName: 'test.eml',
      emailFileSelected: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({})
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailSentDateTime',
        name: 'recallNotificationEmailSentDateTime',
        text: 'Date and time you received the recall email',
        values: {},
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const { errors, valuesToSave } = validateEmail({
      requestBody,
      fileName: 'test.eml',
      emailFileSelected: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({
      recallNotificationEmailSentDateTime: '2021-10-04T13:47:00.000Z',
    })
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'Upload the email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const { errors, valuesToSave } = validateEmail({
      requestBody,
      fileName: 'test.eml',
      emailFileSelected: true,
      uploadFailed: true,
    })
    expect(valuesToSave).toEqual({
      recallNotificationEmailSentDateTime: '2021-10-04T13:47:00.000Z',
    })
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'An error occurred uploading the email',
        values: {
          recallNotificationEmailFileName: 'test.eml',
        },
      },
    ])
  })
})
