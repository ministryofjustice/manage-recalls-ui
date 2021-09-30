import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isEmailValid, isPhoneValid } from '../../helpers/validations'
import { isStringValidReferenceData } from '../../helpers/referenceData/referenceData'

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
    localDeliveryUnitInput,
    authorisingAssistantChiefOfficer,
  } = requestBody
  const emailValid = isEmailValid(probationOfficerEmail)
  const phoneValid = isPhoneValid(probationOfficerPhoneNumber)
  // localDeliveryUnit is the value of the hidden select dropdown that's populated by the autocomplete
  // localDeliveryUnitInput is what the user typed into the autocomplete input. It might be a random string and not a valid LDU, so need validating
  const localDeliveryUnitValid =
    localDeliveryUnit && isStringValidReferenceData('localDeliveryUnits', localDeliveryUnitInput)
  if (
    !probationOfficerName ||
    !probationOfficerEmail ||
    !emailValid ||
    !probationOfficerPhoneNumber ||
    !phoneValid ||
    !localDeliveryUnit ||
    !localDeliveryUnitValid ||
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
    if (!localDeliveryUnit || !localDeliveryUnitValid) {
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
