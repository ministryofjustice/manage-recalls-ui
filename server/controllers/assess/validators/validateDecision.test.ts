import { validateDecision } from './validateDecision'
import * as uploadHelpers from '../../documents/upload/helpers'

describe('validateDecision', () => {
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns valuesToSave, redirect, and no errors if Fixed + detail is submitted', () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, valuesToSave, redirectToPage } = validateDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetail: 'reason 1; reason 2',
    })
    expect(redirectToPage).toEqual('assess-licence')
  })

  it('returns valuesToSave, redirect, and no errors if Standard + detail is submitted', () => {
    const requestBody = {
      confirmedRecallType: 'STANDARD',
      confirmedRecallTypeDetailStandard: 'reason 3; reason 4',
    }
    const { errors, valuesToSave } = validateDecision({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      confirmedRecallType: 'STANDARD',
      confirmedRecallTypeDetail: 'reason 3; reason 4',
    })
  })

  it('returns an error for the Fixed / Standard decision, if not set', () => {
    const { errors, valuesToSave } = validateDecision({
      requestBody: {},
      wasUploadFileReceived: true,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallType',
        name: 'confirmedRecallType',
        text: 'Do you agree with the recall recommendation?',
      },
    ])
  })

  it('returns an error for Fixed detail, if not set', () => {
    const { errors, valuesToSave } = validateDecision({
      requestBody: { confirmedRecallType: 'FIXED' },
      wasUploadFileReceived: true,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeDetailFixed',
        name: 'confirmedRecallTypeDetailFixed',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns an error for Standard detail, if not set', () => {
    const { errors, valuesToSave } = validateDecision({
      requestBody: { confirmedRecallType: 'STANDARD' },
      wasUploadFileReceived: true,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeDetailStandard',
        name: 'confirmedRecallTypeDetailStandard',
        text: 'Provide more detail',
      },
    ])
  })

  it("returns valuesToSave if an email wasn't uploaded, but there is an existing upload", () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, valuesToSave } = validateDecision({
      requestBody: { ...requestBody, CHANGE_RECALL_TYPE_EMAIL: 'existingUpload' },
      wasUploadFileReceived: false,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toEqual({
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetail: 'reason 1; reason 2',
    })
    expect(errors).toBeUndefined()
  })

  it("returns an error if user disagreed and an email wasn't uploaded", () => {
    const requestBody = {
      recommendedRecallType: 'STANDARD',
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, unsavedValues, valuesToSave } = validateDecision({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    })
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it("doesn't return an error if user agreed and an email wasn't uploaded", () => {
    const requestBody = {
      recommendedRecallType: 'STANDARD',
      confirmedRecallType: 'STANDARD',
      confirmedRecallTypeDetailStandard: 'reason 1; reason 2',
    }
    const { errors, unsavedValues, valuesToSave } = validateDecision({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toEqual({ confirmedRecallType: 'STANDARD', confirmedRecallTypeDetail: 'reason 1; reason 2' })
    expect(unsavedValues).toEqual({
      confirmedRecallType: 'STANDARD',
      confirmedRecallTypeDetailStandard: 'reason 1; reason 2',
    })
    expect(errors).toBeUndefined()
  })

  it("doesn't return an error about missing email if user hasn't chosen an answer", () => {
    const requestBody = {
      recommendedRecallType: 'STANDARD',
      confirmedRecallType: '',
      confirmedRecallTypeDetailStandard: '',
    }
    const { errors, unsavedValues, valuesToSave } = validateDecision({
      requestBody,
      wasUploadFileReceived: false,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      confirmedRecallType: '',
      confirmedRecallTypeDetailStandard: '',
    })
    expect(errors).toEqual([
      {
        href: '#confirmedRecallType',
        name: 'confirmedRecallType',
        text: 'Do you agree with the recall recommendation?',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, valuesToSave } = validateDecision({
      requestBody,
      wasUploadFileReceived: true,
      uploadFailed: true,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: 'The selected file could not be uploaded ??? try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, valuesToSave } = validateDecision({
      requestBody,
      wasUploadFileReceived: true,
      uploadFailed: false,
      file: {
        ...file,
        originalname: 'email.pdf',
        mimetype: 'application/pdf',
      },
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: "The selected file 'email.pdf' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the email was too large', () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    jest.spyOn(uploadHelpers, 'isFileSizeTooLarge').mockReturnValue(true)
    const { errors, valuesToSave } = validateDecision({
      requestBody,
      wasUploadFileReceived: true,
      uploadFailed: false,
      file,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: "The selected file 'test.msg' must be smaller than 25MB",
      },
    ])
  })
})
