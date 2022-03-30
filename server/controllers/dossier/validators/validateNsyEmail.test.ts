import { validateNsyEmail } from './validateNsyEmail'
import * as uploadHelpers from '../../documents/upload/helpers'

describe('validateNsyEmail', () => {
  const requestBody = {
    confirmNsyEmailSent: 'YES',
  }
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns no valuesToSave if validation passes', () => {
    const { errors, valuesToSave, redirectToPage } = validateNsyEmail({
      requestBody,
      file,
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
      file,
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
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      confirmNsyEmailSent: 'YES',
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
      file,
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
        href: '#nsyEmailFileName',
        name: 'nsyEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the email was too large', () => {
    jest.spyOn(uploadHelpers, 'isFileSizeTooLarge').mockReturnValue(true)
    const { errors, valuesToSave } = validateNsyEmail({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#nsyEmailFileName',
        name: 'nsyEmailFileName',
        text: "The selected file 'test.msg' must be smaller than 25MB",
      },
    ])
  })
})
