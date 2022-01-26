import { makeErrorObject } from '../../helpers'
import { ReqValidatorReturn, UrlInfo } from '../../../../@types'
import { makeUrl } from '../../../../utils/nunjucksFunctions'

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
    } else if (urlInfo.fromPage) {
      // if we're returning to a 'fromPage' eg recall info, don't include the fromPage querystring when forming the URL
      redirectToPage = makeUrl(urlInfo.fromPage, { basePath: urlInfo.basePath, currentPage: urlInfo.currentPage })
    } else {
      redirectToPage = makeUrl('request-received', urlInfo)
    }
  }
  return { errors, redirectToPage }
}
