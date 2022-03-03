import { validateDecision } from './validateDecision'

describe('validateDecision', () => {
  it('returns valuesToSave, redirect, and no errors if Fixed + detail is submitted', () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, valuesToSave, redirectToPage } = validateDecision({
      requestBody,
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
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
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
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
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
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
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
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
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
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
      emailFileSelected: false,
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toEqual({
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetail: 'reason 1; reason 2',
    })
    expect(errors).toBeUndefined()
  })

  it("returns an error if an email wasn't uploaded", () => {
    const requestBody = {
      confirmedRecallType: 'FIXED',
      confirmedRecallTypeDetailFixed: 'reason 1; reason 2',
    }
    const { errors, valuesToSave } = validateDecision({
      requestBody,
      emailFileSelected: false,
      uploadFailed: false,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: 'Select an email',
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
      emailFileSelected: true,
      uploadFailed: true,
      invalidFileFormat: false,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: 'The selected file could not be uploaded – try again',
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
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: true,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmedRecallTypeEmailFileName',
        name: 'confirmedRecallTypeEmailFileName',
        text: 'The selected file must be an MSG or EML',
      },
    ])
  })
})
