import { validateDossierEmail } from './validateDossierEmail'

describe('validateEmail', () => {
  const requestBody = {
    confirmDossierEmailSent: 'YES',
    dossierEmailSentDateYear: '2021',
    dossierEmailSentDateMonth: '09',
    dossierEmailSentDateDay: '04',
  }
  const actionedByUserId = '00000000-0000-0000-0000-000000000000'

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: false,
      actionedByUserId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      dossierEmailSentDate: '2021-09-04',
      dossierCreatedByUserId: actionedByUserId,
    })
  })

  it("returns valuesToSave if an email wasn't uploaded, but there is an existing upload", () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody: { ...requestBody, DOSSIER_EMAIL: 'existingUpload' },
      emailFileSelected: false,
      uploadFailed: false,
      invalidFileFormat: false,
      actionedByUserId,
    })
    expect(valuesToSave).toEqual({
      dossierEmailSentDate: '2021-09-04',
      dossierCreatedByUserId: actionedByUserId,
    })
    expect(errors).toBeUndefined()
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
      invalidFileFormat: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#confirmDossierEmailSent',
        name: 'confirmDossierEmailSent',
        text: "Confirm you've sent the email to all recipients",
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
      invalidFileFormat: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailSentDate',
        name: 'dossierEmailSentDate',
        text: 'Enter the date you sent the email',
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
      invalidFileFormat: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailFileName',
        name: 'dossierEmailFileName',
        text: 'Select an email',
      },
    ])
  })

  it('returns an error if the email upload failed', () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.msg',
      emailFileSelected: true,
      uploadFailed: true,
      invalidFileFormat: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailFileName',
        name: 'dossierEmailFileName',
        text: 'The selected file could not be uploaded – try again',
      },
    ])
  })

  it('returns an error if an invalid email file extension was uploaded', () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody,
      fileName: 'test.msl',
      emailFileSelected: true,
      uploadFailed: false,
      invalidFileFormat: true,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailFileName',
        name: 'dossierEmailFileName',
        text: 'The selected file must be an MSG or EML',
      },
    ])
  })
})
