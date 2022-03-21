import { validateNsyEmail } from './validateNsyEmail'

describe('validateNsyEmail', () => {
  const requestBody = {
    confirmNsyEmailSent: 'YES',
  }

  it('returns no valuesToSave if validation passes', () => {
    const { errors, valuesToSave, redirectToPage } = validateNsyEmail({
      requestBody,
      fileName: 'test.msg',
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toBeUndefined()
    expect(redirectToPage).toEqual('dossier-letter')
  })

  it("returns no errors if an email wasn't uploaded, but there is an existing upload", () => {
    const { errors } = validateNsyEmail({
      requestBody: { ...requestBody, NSY_REMOVE_WARRANT_EMAIL: 'existingUpload' },
      wasUploadFileReceived: false,
      uploadFailed: false,
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
      wasUploadFileReceived: true,
      uploadFailed: false,
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
      wasUploadFileReceived: false,
      uploadFailed: false,
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
      wasUploadFileReceived: true,
      uploadFailed: true,
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
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#nsyEmailFileName',
        name: 'nsyEmailFileName',
        text: "The selected file 'test.msl' must be a MSG or EML",
      },
    ])
  })
})
