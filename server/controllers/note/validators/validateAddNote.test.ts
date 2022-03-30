import { validateAddNote } from './validateAddNote'

describe('validateAddNote', () => {
  const file = {
    originalname: 'test.docx',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  } as Express.Multer.File

  it('returns valuesToSave with subject and details, and no errors if all fields are submitted and file is valid', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, unsavedValues, valuesToSave } = validateAddNote({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(unsavedValues).toEqual({
      details: 'details text',
      subject: 'subject text',
    })
    expect(valuesToSave).toEqual({
      subject: 'subject text',
      details: 'details text',
    })
  })

  // TODO: PUD-1489: here or in re-work fileName has also to be returned
  it('returns valuesToSave with subject and details, and no errors if subject and details are submitted without a file', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, valuesToSave } = validateAddNote({
      requestBody,
      file,
      wasUploadFileReceived: false,
      uploadFailed: undefined,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      subject: 'subject text',
      details: 'details text',
    })
  })

  it('returns errors if subject and details are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateAddNote({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      subject: undefined,
      details: undefined,
    })
    expect(errors).toEqual([
      {
        href: '#subject',
        name: 'subject',
        text: 'Enter a subject',
      },
      {
        href: '#details',
        name: 'details',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns error for details if only details missing, with subject in unsavedValues and no valuesToSave', () => {
    const requestBody = {
      subject: 'subject text',
    }
    const { errors, valuesToSave, unsavedValues } = validateAddNote({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual(requestBody)
    expect(errors).toEqual([
      {
        href: '#details',
        name: 'details',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns error for subject if only subject missing, with details in unsavedValues and no valuesToSave', () => {
    const requestBody = {
      details: 'details text',
    }
    const { errors, valuesToSave, unsavedValues } = validateAddNote({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual(requestBody)
    expect(errors).toEqual([
      {
        href: '#subject',
        name: 'subject',
        text: 'Enter a subject',
      },
    ])
  })

  it('returns an error if the file upload was tried and failed', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, valuesToSave, unsavedValues } = validateAddNote({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual(requestBody)
    expect(errors).toEqual([
      {
        href: '#fileName',
        name: 'fileName',
        text: 'test.docx could not be uploaded - try again',
      },
    ])
  })

  it('returns an error if the file upload was tried and an invalid note file format was uploaded', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, valuesToSave } = validateAddNote({
      requestBody,
      file: {
        ...file,
        originalname: 'whatever.ext',
        mimetype: 'application/pdf',
      },
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#fileName',
        name: 'fileName',
        text: "The selected file 'whatever.ext' must be an MSG, EML, DOC, DOCX or PDF",
      },
    ])
  })
})
