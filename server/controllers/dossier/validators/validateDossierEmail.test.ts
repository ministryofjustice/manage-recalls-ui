import { validateDossierEmail } from './validateDossierEmail'

describe('validateDossierEmail', () => {
  const requestBody = {
    confirmDossierEmailSent: 'YES',
    dossierEmailSentDateYear: '2021',
    dossierEmailSentDateMonth: '09',
    dossierEmailSentDateDay: '04',
  }
  const actionedByUserId = '00000000-0000-0000-0000-000000000000'
  const file = {
    originalname: 'test.msg',
    buffer: Buffer.from('def', 'base64'),
    mimetype: 'application/octet-stream',
  } as Express.Multer.File

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave, redirectToPage } = validateDossierEmail({
      requestBody,
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      dossierEmailSentDate: '2021-09-04',
      dossierCreatedByUserId: actionedByUserId,
    })
    expect(redirectToPage).toEqual('dossier-confirmation')
  })

  it("returns valuesToSave if an email wasn't uploaded, but there is an existing upload", () => {
    const { errors, valuesToSave } = validateDossierEmail({
      requestBody: { ...requestBody, DOSSIER_EMAIL: 'existingUpload' },
      wasUploadFileReceived: false,
      uploadFailed: false,
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
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
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
      file,
      wasUploadFileReceived: true,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#dossierEmailSentDate-dossierEmailSentDateDay',
        name: 'dossierEmailSentDate',
        text: 'Enter the date you sent the email',
        values: {},
      },
    ])
  })

  it("returns an error if an email wasn't uploaded", () => {
    const { errors, unsavedValues, valuesToSave } = validateDossierEmail({
      requestBody,
      file,
      wasUploadFileReceived: false,
      uploadFailed: false,
      actionedByUserId,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      confirmDossierEmailSent: 'YES',
      dossierEmailFileName: 'test.msg',
      dossierEmailSentDateParts: {
        day: '04',
        month: '09',
        year: '2021',
      },
    })
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
      file,
      wasUploadFileReceived: true,
      uploadFailed: true,
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
      file: {
        ...file,
        originalname: 'email.pdf',
        mimetype: 'application/pdf',
      },
      wasUploadFileReceived: true,
      uploadFailed: false,
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
