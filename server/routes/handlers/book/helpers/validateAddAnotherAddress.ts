import { makeErrorObject, makeUrl } from '../../helpers'
import { ReqValidatorReturn, UrlInfo } from '../../../../@types'

export const validateAddAnotherAddress = ({
  addAnotherAddressOption,
  urlInfo,
}: {
  addAnotherAddressOption: string
  urlInfo: UrlInfo
}): ReqValidatorReturn => {
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
      redirectToPage = 'postcode-lookup'
    } else {
      redirectToPage = urlInfo.fromPage || 'request-received'
    }
  }
  return { errors, redirectToPage: makeUrl(redirectToPage, urlInfo) }
}
