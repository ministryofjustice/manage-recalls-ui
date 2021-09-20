import { validateDossierEmail } from './validateDossierEmail'

describe('validateEmail', () => {
  const requestBody = {
    confirmDossierEmailSent: 'YES',
    dossierEmailSentDateYear: '2021',
    dossierEmailSentDateMonth: '09',
    dossierEmailSentDateDay: '4',
  }

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      dossierEmailSentDate: '2021-09-04',
    })
  })

  it('returns an error for the confirm checkbox only, if no fields submitted', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody: emptyBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmDossierEmailSent',
        name: 'confirmDossierEmailSent',
        text: 'Confirm you sent the email to all recipients',
      },
    ])
  })

  it('returns an error for the sent date, if confirm checkbox is checked', () => {
    const body = {
      confirmDossierEmailSent: 'YES',
    }
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody: body,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailSentDate',
        name: 'dossierEmailSentDate',
        text: 'Date you sent the dossier email',
        values: {},
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: false,
      uploadFailed: false,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailFileName',
        name: 'dossierEmailFileName',
        text: 'Upload the email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: true,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailFileName',
        name: 'dossierEmailFileName',
        text: 'An error occurred uploading the email',
        values: 'test.msg',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.eml',
      emailFileSelected: true,
      uploadFailed: true,
      allowedFileExtensions: ['.msg'],
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailFileName',
        name: 'dossierEmailFileName',
        text: 'An error occurred uploading the email',
        values: 'test.eml',
      },
    ])
  })
})
