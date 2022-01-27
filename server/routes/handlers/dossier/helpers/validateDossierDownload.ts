import { makeErrorObject, makeUrl } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'

export const validateDossierDownload = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
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
  return { errors, valuesToSave, unsavedValues, redirectToPage: makeUrl('dossier-email', urlInfo) }
}
