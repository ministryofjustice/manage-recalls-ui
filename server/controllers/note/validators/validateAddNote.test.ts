import { validateAddNote } from './validateAddNote'

describe('validateAddNote', () => {
  it('returns valuesToSave with subject and details, and no errors if both fields are submitted', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, valuesToSave } = validateAddNote({
      requestBody,
      fileName: 'test.docx',
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      subject: 'subject text',
      details: 'details text',
    })
  })

  it('returns errors if both fields are missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateAddNote({
      requestBody,
      fileName: 'test.docx',
      uploadFailed: false,
      invalidFileFormat: false,
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
        text: 'Provide more detail',
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
      fileName: 'test.docx',
      uploadFailed: false,
      invalidFileFormat: false,
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
      fileName: 'test.docx',
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual(requestBody)
    expect(errors).toEqual([
      {
        href: '#subject',
        name: 'subject',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, valuesToSave, unsavedValues } = validateAddNote({
      requestBody,
      fileName: 'test.docx',
      uploadFailed: true,
      invalidFileFormat: false,
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

  it('returns an error if an invalid note file format was uploaded', () => {
    const requestBody = {
      subject: 'subject text',
      details: 'details text',
    }
    const { errors, valuesToSave } = validateAddNote({
      requestBody,
      fileName: 'whatever.ext',
      uploadFailed: false,
      invalidFileFormat: true,
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
