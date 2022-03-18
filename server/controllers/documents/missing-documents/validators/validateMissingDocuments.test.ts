import { validateMissingDocuments } from './validateMissingDocuments'

describe('validateMissingDocuments', () => {
  it('returns valuesToSave if everything is valid', () => {
    const requestBody = {
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    }
    const { errors, valuesToSave, unsavedValues } = validateMissingDocuments({
      requestBody,
      fileName: 'test.msg',
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toEqual({ missingDocumentsDetail: 'Email sent on 12/10/2021' })
    expect(unsavedValues).toEqual({
      missingDocumentsDetail: 'Email sent on 12/10/2021',
    })
    expect(errors).toBeUndefined()
  })

  it('returns an error if detail is missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateMissingDocuments({
      requestBody,
      fileName: 'test.msg',
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
      fileName: 'test.eml',
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
      fileName: 'test.msg',
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
      fileName: 'test.msl',
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#missingDocumentsEmailFileName',
        name: 'missingDocumentsEmailFileName',
        text: "The selected file 'test.msl' must be a MSG or EML",
      },
    ])
  })
})
