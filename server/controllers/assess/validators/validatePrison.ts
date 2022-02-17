import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isStringValidReferenceData } from '../../../referenceData'
import { formatValidationErrorMessage, makeErrorObject } from '../../utils/errorMessages'
import { makeUrlToFromPage } from '../../utils/makeUrl'

export const validatePrison = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave

  const { currentPrison, currentPrisonInput } = requestBody
  // currentPrison is the value of the hidden select dropdown that's populated by the autocomplete
  // currentPrisonInput is what the user typed into the autocomplete input. It might be a random string and not a valid prison, so needs validating
  const currentPrisonInvalidInput = Boolean(
    currentPrisonInput && !isStringValidReferenceData('prisons', currentPrisonInput)
  )
  if (currentPrisonInvalidInput) {
    errors = [
      makeErrorObject({
        id: 'currentPrison',
        text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a prison'),
        values: currentPrisonInput,
      }),
    ]
  } else if (!currentPrison) {
    errors = [
      makeErrorObject({
        id: 'currentPrison',
        text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a prison'),
      }),
    ]
  }
  if (!errors) {
    valuesToSave = { currentPrison }
  }
  return { errors, valuesToSave, redirectToPage: makeUrlToFromPage(urlInfo.fromPage || 'assess-download', urlInfo) }
}
