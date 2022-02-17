import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isStringValidReferenceData } from '../../../referenceData'
import { formatValidationErrorMessage, makeErrorObject } from '../../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'

export const validatePolice = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave

  const { localPoliceForceId, localPoliceForceIdInput } = requestBody
  // localPoliceForceId is the value of the hidden select dropdown that's populated by the autocomplete
  // localPoliceForceIdInput is what the user typed into the autocomplete input. It might be a random string and not a valid policeForces name, so needs validating
  const localPoliceForceInvalidInput = Boolean(
    localPoliceForceIdInput && !isStringValidReferenceData('policeForces', localPoliceForceIdInput)
  )

  if (!localPoliceForceId || localPoliceForceInvalidInput) {
    errors = []
    if (localPoliceForceInvalidInput) {
      errors.push(
        makeErrorObject({
          id: 'localPoliceForceId',
          text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a local police force'),
          values: localPoliceForceIdInput,
        })
      )
    } else if (!localPoliceForceId) {
      errors.push(
        makeErrorObject({
          id: 'localPoliceForceId',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a local police force'),
        })
      )
    }
  }
  if (!errors) {
    valuesToSave = {
      localPoliceForceId,
    } as UpdateRecallRequest
  }
  return {
    errors,
    valuesToSave,
    redirectToPage: urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('issues-needs', urlInfo),
  }
}
