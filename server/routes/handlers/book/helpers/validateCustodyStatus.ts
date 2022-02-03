import { makeErrorObject } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../helpers/makeUrl'

export const validateCustodyStatus = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave
  let redirectToPage

  const { inCustody } = requestBody
  if (!inCustody || !['YES', 'NO'].includes(inCustody)) {
    errors = [
      makeErrorObject({
        id: 'inCustody',
        text: 'Is {{ recall.fullName }} in custody?',
      }),
    ]
  }
  if (!errors) {
    const isInCustody = inCustody === 'YES'
    if (isInCustody) {
      redirectToPage = urlInfo.fromPage
        ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
        : makeUrl('request-received', urlInfo)
    } else {
      // if not in custody, proceed to last known address question, even if user arrived from a recall info page (ie change link)
      redirectToPage = makeUrl('last-known-address', urlInfo)
    }
    valuesToSave = {
      inCustody: isInCustody,
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
