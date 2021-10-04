import { validateRecallNotificationEmail } from './validateRecallNotificationEmail'

describe('validateEmail', () => {
  const requestBody = {
    confirmRecallNotificationEmailSent: 'YES',
    recallNotificationEmailSentDateTimeYear: '2021',
    recallNotificationEmailSentDateTimeMonth: '09',
    recallNotificationEmailSentDateTimeDay: '4',
    recallNotificationEmailSentDateTimeHour: '14',
    recallNotificationEmailSentDateTimeMinute: '47',
  }
  const actionedByUserId = '00000000-0000-0000-0000-000000000000'

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateRecallNotificationEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      recallNotificationEmailSentDateTime: '2021-09-04T13:47:00.000Z',
      assessedByUserId: actionedByUserId,
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
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailSentDateTime',
        name: 'recallNotificationEmailSentDateTime',
        text: 'Enter the date and time you sent the email',
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
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
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
      fileName: 'test.msg',
      emailFileSelected: true,
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
      fileName: 'test.msl',
      emailFileSelected: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#recallNotificationEmailFileName',
        name: 'recallNotificationEmailFileName',
        text: 'The selected file must be an MSG or EML',
        values: 'test.msl',
      },
    ])
  })
})
