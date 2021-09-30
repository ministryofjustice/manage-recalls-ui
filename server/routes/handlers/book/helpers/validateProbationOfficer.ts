import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isEmailValid, isPhoneValid } from '../../helpers/validations'

export const validateProbationOfficer = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    probationOfficerName,
    probationOfficerEmail,
    probationOfficerPhoneNumber,
    localDeliveryUnit,
    authorisingAssistantChiefOfficer,
  } = requestBody
  const emailValid = isEmailValid(probationOfficerEmail)
  const phoneValid = isPhoneValid(probationOfficerPhoneNumber)
  if (
    !probationOfficerName ||
    !probationOfficerEmail ||
    !emailValid ||
    !probationOfficerPhoneNumber ||
    !phoneValid ||
    !localDeliveryUnit ||
    !authorisingAssistantChiefOfficer
  ) {
    errors = []
    if (!probationOfficerName) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerName',
          text: 'Enter a name',
        })
      )
    }
    if (!probationOfficerEmail) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: 'Enter an email',
        })
      )
    }
    if (probationOfficerEmail && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: 'Enter an email address in the correct format, like name@example.com',
          values: probationOfficerEmail,
        })
      )
    }
    if (!probationOfficerPhoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: 'Enter a phone number',
        })
      )
    }
    if (probationOfficerPhoneNumber && !phoneValid) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: 'Enter a phone number in the correct format, like 01277 960901',
          values: probationOfficerPhoneNumber,
        })
      )
    }
    if (!localDeliveryUnit) {
      errors.push(
        makeErrorObject({
          id: 'localDeliveryUnit',
          text: 'Select a Local Delivery Unit',
        })
      )
    }
    if (!authorisingAssistantChiefOfficer) {
      errors.push(
        makeErrorObject({
          id: 'authorisingAssistantChiefOfficer',
          text: 'Enter the Assistant Chief Officer',
        })
      )
    }
    unsavedValues = {
      probationOfficerName,
      probationOfficerEmail,
      probationOfficerPhoneNumber,
      localDeliveryUnit,
      authorisingAssistantChiefOfficer,
    }
  }
  if (!errors) {
    valuesToSave = {
      probationOfficerName,
      probationOfficerEmail,
      probationOfficerPhoneNumber,
      localDeliveryUnit: UpdateRecallRequest.localDeliveryUnit[localDeliveryUnit],
      authorisingAssistantChiefOfficer,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
