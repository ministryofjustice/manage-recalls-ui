import { validateMissingDocuments } from './validateMissingDocuments'

describe('validateMissingDocuments', () => {
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns valuesToSave and a confirmation message if everything is valid', () => {
    const requestBody = {
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    }

    const { errors, valuesToSave, unsavedValues, confirmationMessage } = validateMissingDocuments({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({ missingDocumentsDetail: 'Email sent on 12/10/2021' })
    expect(unsavedValues).toEqual({
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    })
    expect(errors).toBeUndefined()
    expect(confirmationMessage).toEqual({
      link: {
        href: '#missing-documents',
        text: 'View',
      },
      text: 'Chase note added.',
      type: 'success',
    })
  })

  it('returns an error if detail is missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateMissingDocuments({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      missingDocumentsDetail: undefined,
    })
    expect(errors).toEqual([
      {
        href: '#missingDocumentsDetail',
        name: 'missingDocumentsDetail',
        text: 'Provide more detail',
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const requestBody = {
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    }
    const { errors, valuesToSave } = validateMissingDocuments({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#missingDocumentsEmailFileName',
        name: 'missingDocumentsEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const requestBody = {
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    }
    const { errors, valuesToSave } = validateMissingDocuments({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#missingDocumentsEmailFileName',
        name: 'missingDocumentsEmailFileName',
        text: 'The selected file could not be uploaded – try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const requestBody = {
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    }
    const { errors, valuesToSave } = validateMissingDocuments({
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
        href: '#missingDocumentsEmailFileName',
        name: 'missingDocumentsEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })
})
