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
          text: "Probation officer's name",
        })
      )
    }
    if (!probationOfficerEmail) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: "Probation officer's email",
          errorMsgForField: "Enter the probation officer's email address",
        })
      )
    }
    if (probationOfficerEmail && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: "Probation officer's email",
          errorMsgForField: 'Enter a valid email address',
          values: probationOfficerEmail,
        })
      )
    }
    if (!probationOfficerPhoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: "Probation officer's phone number",
          errorMsgForField: "Enter the probation officer's phone number",
        })
      )
    }
    if (probationOfficerPhoneNumber && !phoneValid) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: "Probation officer's phone number",
          errorMsgForField: 'Enter a valid UK phone number',
          values: probationOfficerPhoneNumber,
        })
      )
    }
    if (!localDeliveryUnit) {
      errors.push(
        makeErrorObject({
          id: 'localDeliveryUnit',
          text: 'Local Delivery Unit',
        })
      )
    }
    if (!authorisingAssistantChiefOfficer) {
      errors.push(
        makeErrorObject({
          id: 'authorisingAssistantChiefOfficer',
          text: 'Assistant Chief Officer',
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
