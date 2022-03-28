import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'

export const validateLastKnownAddress = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave
  let redirectToPage

  const { lastKnownAddressOption } = requestBody
  if (!lastKnownAddressOption || !['YES', 'NO_FIXED_ABODE'].includes(lastKnownAddressOption)) {
    errors = [
      makeErrorObject({
        id: 'lastKnownAddressOption',
        text: 'Does <span data-private>{{ recall.fullName }}</span> have a last known address?',
      }),
    ]
  }
  if (!errors) {
    if (lastKnownAddressOption === 'NO_FIXED_ABODE') {
      redirectToPage = urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('recall-type', urlInfo)
    } else {
      // if they have an address, proceed to postcode lookup, even if user arrived from a recall info page (ie change link)
      redirectToPage = makeUrl('postcode-lookup', urlInfo)
    }
    valuesToSave = {
      lastKnownAddressOption: lastKnownAddressOption as UpdateRecallRequest.lastKnownAddressOption,
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
