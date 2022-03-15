import { validateUserDetails } from './validateUserDetails'

describe('validateUserDetails', () => {
  const requestBody = {
    firstName: 'Barry',
    lastName: 'Badger',
    email: 'barry@badger.com',
    phoneNumber: '07393783784',
    caseworkerBand: 'FOUR_PLUS',
    userId: '123',
  }
  const file = {
    originalname: 'signature.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('def', 'base64'),
  } as Express.Multer.File

  it('returns valuesToSave, confirmationMessage and no errors if all fields are submitted', () => {
    const { errors, valuesToSave, confirmationMessage } = validateUserDetails(requestBody, file)
    expect(errors).toBeUndefined()
    expect(confirmationMessage).toEqual({
      text: 'User details have been updated.',
      type: 'success',
    })
    expect(valuesToSave).toEqual({
      caseworkerBand: 'FOUR_PLUS',
      email: 'barry@badger.com',
      firstName: 'Barry',
      lastName: 'Badger',
      phoneNumber: '07393783784',
      signature: 'dec=',
    })
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const emptyBody = {}
    const { errors, valuesToSave } = validateUserDetails(emptyBody, null)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#firstName',
        name: 'firstName',
        text: 'Enter a first name',
      },
      {
        href: '#lastName',
        name: 'lastName',
        text: 'Enter a last name',
      },
      {
        href: '#email',
        name: 'email',
        text: 'Enter an email address',
      },
      {
        href: '#phoneNumber',
        name: 'phoneNumber',
        text: 'Enter a phone number',
      },
      {
        href: '#caseworkerBand',
        name: 'caseworkerBand',
        text: 'Select a band',
      },
      {
        href: '#signature',
        name: 'signature',
        text: 'Upload a signature',
      },
    ])
  })

  it('returns errors for invalid email and phone, and no valuesToSave', () => {
    const { errors, valuesToSave } = validateUserDetails(
      {
        ...requestBody,
        phoneNumber: '003139485349',
        email: 'probation.office',
      },
      file
    )
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#email',
        name: 'email',
        text: 'Enter an email address in the correct format, like name@example.com',
        values: 'probation.office',
      },
      {
        href: '#phoneNumber',
        name: 'phoneNumber',
        text: 'Enter a phone number in the correct format, like 01277 960901',
        values: '003139485349',
      },
    ])
  })

  it("doesn't create an error if no signature uploaded, but one already exists", () => {
    const { errors, valuesToSave, confirmationMessage } = validateUserDetails(
      { ...requestBody, existingSignature: 'abc' },
      null
    )
    expect(errors).toBeUndefined()
    expect(confirmationMessage).toEqual({
      text: 'User details have been updated.',
      type: 'success',
    })
    expect(valuesToSave).toEqual({
      caseworkerBand: 'FOUR_PLUS',
      email: 'barry@badger.com',
      firstName: 'Barry',
      lastName: 'Badger',
      phoneNumber: '07393783784',
      signature: 'abc',
    })
  })

  it('returns an errors for invalid signature filename', () => {
    const { errors, valuesToSave } = validateUserDetails(requestBody, {
      ...file,
      originalname: 'signature.pdf',
    } as Express.Multer.File)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#signature',
        name: 'signature',
        text: 'The selected signature image must be a JPG or JPEG',
      },
    ])
  })
})
