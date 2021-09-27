import { PhoneNumberUtil } from 'google-libphonenumber'
import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

const validEmailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

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
  let isPhoneValid = true
  const isEmailValid = validEmailRegex.test(probationOfficerEmail)
  try {
    const phoneUtil = PhoneNumberUtil.getInstance()
    isPhoneValid = phoneUtil.isValidNumberForRegion(phoneUtil.parse(probationOfficerPhoneNumber, 'GB'), 'GB')
  } catch (err) {
    isPhoneValid = false
  }
  if (
    !probationOfficerName ||
    !probationOfficerEmail ||
    !isEmailValid ||
    !probationOfficerPhoneNumber ||
    !isPhoneValid ||
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
    if (probationOfficerEmail && !isEmailValid) {
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
    if (probationOfficerPhoneNumber && !isPhoneValid) {
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
