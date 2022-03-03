import { validateNsyEmail } from './validateNsyEmail'

describe('validateNsyEmail', () => {
  const requestBody = {
    confirmNsyEmailSent: 'YES',
  }

  it('returns no valuesToSave if validation passes', () => {
    const { errors, valuesToSave, redirectToPage } = validateNsyEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toBeUndefined()
    expect(redirectToPage).toEqual('dossier-letter')
  })

  it("returns no errors if an email wasn't uploaded, but there is an existing upload", () => {
    const { errors } = validateNsyEmail({
      requestBody: { ...requestBody, NSY_REMOVE_WARRANT_EMAIL: 'existingUpload' },
      emailFileSelected: false,
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(errors).toBeUndefined()
  })

  it('returns an error for the confirm checkbox only, if no fields submitted', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateNsyEmail({
      requestBody: emptyBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmNsyEmailSent',
        name: 'confirmNsyEmailSent',
        text: "Confirm you've sent the email to all recipients",
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const { errors, unsavedValues, valuesToSave } = validateNsyEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: false,
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      confirmNsyEmailSent: 'YES',
      nsyEmailFileName: 'test.msg',
    })
    expect(errors).toEqual([
      {
        href: '#nsyEmailFileName',
        name: 'nsyEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const { errors, valuesToSave } = validateNsyEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: true,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#nsyEmailFileName',
        name: 'nsyEmailFileName',
        text: 'The selected file could not be uploaded – try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const { errors, valuesToSave } = validateNsyEmail({
      requestBody,
      fileName: 'test.msl',
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#nsyEmailFileName',
        name: 'nsyEmailFileName',
        text: 'The selected file must be an MSG or EML',
      },
    ])
  })
})
