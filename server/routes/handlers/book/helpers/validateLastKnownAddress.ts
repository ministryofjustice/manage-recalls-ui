import { makeErrorObject } from '../../helpers'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api'

export const validateLastKnownAddress = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
  let errors
  let valuesToSave
  let redirectToPage

  const { lastKnownAddressOption } = requestBody
  if (!lastKnownAddressOption || !['YES', 'NO_FIXED_ABODE'].includes(lastKnownAddressOption)) {
    errors = [
      makeErrorObject({
        id: 'lastKnownAddressOption',
        text: 'Does {{ recall.fullName }} have a last known address?',
      }),
    ]
  }
  if (!errors) {
    if (lastKnownAddressOption === 'YES') {
      redirectToPage = 'postcode-lookup'
    }
    valuesToSave = {
      lastKnownAddressOption: lastKnownAddressOption as UpdateRecallRequest.lastKnownAddressOption,
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
