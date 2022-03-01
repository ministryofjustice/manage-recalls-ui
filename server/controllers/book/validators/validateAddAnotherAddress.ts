import { ReqValidatorReturn, UrlInfo } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateAddAnotherAddress = ({
  addAnotherAddressOption,
  urlInfo,
}: {
  addAnotherAddressOption: string
  urlInfo: UrlInfo
}): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let redirectToPage

  if (!addAnotherAddressOption || !['YES', 'NO'].includes(addAnotherAddressOption)) {
    errors = [
      makeErrorObject({
        id: 'addAnotherAddressOption',
        text: 'Do you want to add another address?',
      }),
    ]
  }
  if (!errors) {
    if (addAnotherAddressOption === 'YES') {
      redirectToPage = makeUrl('postcode-lookup', urlInfo)
    } else {
      redirectToPage = urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('recall-type', urlInfo)
    }
  }
  return { errors, redirectToPage }
}
