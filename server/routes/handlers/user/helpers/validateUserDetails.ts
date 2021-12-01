import { listToString, makeErrorObject } from '../../helpers'
import { AllowedUploadFileType, NamedFormError, ObjectMap } from '../../../../@types'
import { allowedImageFileExtensions } from '../../helpers/allowedUploadExtensions'
import { AddUserDetailsRequest } from '../../../../@types/manage-recalls-api/models/AddUserDetailsRequest'

export const isInvalidFileType = (file: Express.Multer.File, allowedExtensions: AllowedUploadFileType[]) => {
  return !allowedExtensions.some(ext => file.originalname.endsWith(ext.extension) && file.mimetype === ext.mimeType)
}

export const validateUserDetails = (
  requestBody: ObjectMap<string>,
  file?: Express.Multer.File
): { errors?: NamedFormError[]; valuesToSave: AddUserDetailsRequest; unsavedValues: ObjectMap<string> } => {
  let errors
  let valuesToSave
  let unsavedValues

  const { firstName, lastName, signatureEncoded, email, phoneNumber, caseworkerBand } = requestBody
  const isFieldMissing =
    !firstName || !lastName || !email || !phoneNumber || !caseworkerBand || (!signatureEncoded && !file)
  const isInvalidSignatureUpload = file && isInvalidFileType(file, allowedImageFileExtensions)

  if (isFieldMissing || isInvalidSignatureUpload) {
    errors = []
    if (!firstName) {
      errors.push(
        makeErrorObject({
          id: 'firstName',
          text: 'Enter a first name',
        })
      )
    }
    if (!lastName) {
      errors.push(
        makeErrorObject({
          id: 'lastName',
          text: 'Enter a last name',
        })
      )
    }
    if (!email) {
      errors.push(
        makeErrorObject({
          id: 'email',
          text: 'Enter an email address',
        })
      )
    }
    if (!phoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'phoneNumber',
          text: 'Enter a phone number',
        })
      )
    }
    if (!caseworkerBand) {
      errors.push(
        makeErrorObject({
          id: 'caseworkerBand',
          text: 'Select a band',
        })
      )
    }
    if (!signatureEncoded && !file) {
      errors.push(
        makeErrorObject({
          id: 'signature',
          text: 'Upload a signature',
        })
      )
    }
    if (isInvalidSignatureUpload) {
      errors.push(
        makeErrorObject({
          id: 'signature',
          text: `The selected signature image must be a ${listToString(
            allowedImageFileExtensions.map(ext => ext.label),
            'or'
          )}`,
        })
      )
    }
    unsavedValues = {
      firstName,
      lastName,
      email,
      phoneNumber,
      caseworkerBand: caseworkerBand as AddUserDetailsRequest.caseworkerBand,
      signatureEncoded,
    }
  }
  if (!errors) {
    let signature
    if (file) {
      signature = file.buffer.toString('base64')
    } else {
      signature = signatureEncoded
    }
    valuesToSave = {
      firstName,
      lastName,
      signature,
      email,
      phoneNumber,
      caseworkerBand: caseworkerBand as AddUserDetailsRequest.caseworkerBand,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
