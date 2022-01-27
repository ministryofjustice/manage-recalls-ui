import { makeErrorObject, makeUrl } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api'

export const validateLastKnownAddress = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
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
    if (lastKnownAddressOption === 'NO_FIXED_ABODE') {
      redirectToPage = urlInfo.fromPage || 'request-received'
    } else {
      // if they have an address, proceed to postcode lookup, even if user arrived from a recall info page (ie change link)
      redirectToPage = 'postcode-lookup'
    }
    valuesToSave = {
      lastKnownAddressOption: lastKnownAddressOption as UpdateRecallRequest.lastKnownAddressOption,
    }
  }
  return { errors, valuesToSave, redirectToPage: makeUrl(redirectToPage, urlInfo) }
}
