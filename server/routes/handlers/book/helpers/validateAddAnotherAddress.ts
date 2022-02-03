import { makeErrorObject } from '../../helpers'
import { ReqValidatorReturn, UrlInfo } from '../../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../helpers/makeUrl'

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
      redirectToPage = makeUrl('postcode-lookup', urlInfo)
    } else {
      redirectToPage = urlInfo.fromPage
        ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
        : makeUrl('request-received', urlInfo)
    }
  }
  return { errors, redirectToPage }
}
