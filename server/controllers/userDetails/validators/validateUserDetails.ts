import { ConfirmationMessage, NamedFormError, ObjectMap } from '../../../@types'
import { allowedImageFileExtensions } from '../../documents/upload/helpers/allowedUploadExtensions'
import { AddUserDetailsRequest } from '../../../@types/manage-recalls-api/models/AddUserDetailsRequest'
import { AllowedUploadFileType } from '../../../@types/documents'
import { errorMsgInvalidEmail, errorMsgInvalidPhoneNumber, makeErrorObject } from '../../utils/errorMessages'
import { listToString } from '../../utils/lists'
import { isEmailValid, isPhoneValid } from '../../utils/validate-formats'

export const isInvalidFileType = (file: Express.Multer.File, allowedExtensions: AllowedUploadFileType[]) => {
  return !allowedExtensions.some(ext => file.originalname.endsWith(ext.extension) && file.mimetype === ext.mimeType)
}

export const validateUserDetails = (
  requestBody: ObjectMap<string>,
  file?: Express.Multer.File
): {
  errors?: NamedFormError[]
  valuesToSave: AddUserDetailsRequest
  unsavedValues: ObjectMap<string>
  confirmationMessage?: ConfirmationMessage
} => {
  let errors
  let valuesToSave
  let unsavedValues
  let confirmationMessage

  const { firstName, lastName, existingSignature, email, phoneNumber, caseworkerBand } = requestBody
  const isFieldMissing =
    !firstName || !lastName || !email || !phoneNumber || !caseworkerBand || (!existingSignature && !file)
  const isInvalidSignatureUpload = file && isInvalidFileType(file, allowedImageFileExtensions)
  const emailValid = isEmailValid(email)
  const phoneValid = isPhoneValid(phoneNumber)

  if (isFieldMissing || isInvalidSignatureUpload || !emailValid || !phoneValid) {
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
    if (email && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'email',
          text: errorMsgInvalidEmail,
          values: email,
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
    if (phoneNumber && !phoneValid) {
      errors.push(
        makeErrorObject({
          id: 'phoneNumber',
          text: errorMsgInvalidPhoneNumber,
          values: phoneNumber,
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
    if (!existingSignature && !file) {
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
      existingSignature,
    }
  }
  if (!errors) {
    let signature
    if (file) {
      signature = file.buffer.toString('base64')
    } else {
      signature = existingSignature
    }
    valuesToSave = {
      firstName,
      lastName,
      signature,
      email,
      phoneNumber,
      caseworkerBand: caseworkerBand as AddUserDetailsRequest.caseworkerBand,
    }
    confirmationMessage = {
      text: 'User details have been updated.',
      type: 'success',
    }
  }
  return { errors, valuesToSave, unsavedValues, confirmationMessage }
}
