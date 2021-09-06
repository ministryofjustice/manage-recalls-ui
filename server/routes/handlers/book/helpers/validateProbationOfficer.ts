import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

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
    probationDivision,
    authorisingAssistantChiefOfficer,
  } = requestBody

  if (
    !probationOfficerName ||
    !probationOfficerEmail ||
    !probationOfficerPhoneNumber ||
    !probationDivision ||
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
        })
      )
    }
    if (!probationOfficerPhoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: "Probation officer's phone number",
        })
      )
    }
    if (!probationDivision) {
      errors.push(
        makeErrorObject({
          id: 'probationDivision',
          text: 'Probation division',
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
      probationDivision,
      authorisingAssistantChiefOfficer,
    }
  }
  if (!errors) {
    valuesToSave = {
      probationOfficerName,
      probationOfficerEmail,
      probationOfficerPhoneNumber,
      probationDivision: UpdateRecallRequest.probationDivision[probationDivision],
      authorisingAssistantChiefOfficer,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
