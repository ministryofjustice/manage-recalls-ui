import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validateDossierDownload = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues
  let valuesToSave

  const { hasDossierBeenChecked } = requestBody
  const isDossierCheckedYes = hasDossierBeenChecked === 'YES'

  if (!isDossierCheckedYes) {
    errors = []
    if (!isDossierCheckedYes) {
      errors.push(
        makeErrorObject({
          id: 'hasDossierBeenChecked',
          text: "Confirm you've checked the information in the dossier and letter",
        })
      )
    }
    unsavedValues = {
      hasDossierBeenChecked,
    }
  }
  if (!errors) {
    valuesToSave = {
      hasDossierBeenChecked: isDossierCheckedYes,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
