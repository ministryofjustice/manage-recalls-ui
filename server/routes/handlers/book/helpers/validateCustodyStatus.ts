import { makeErrorObject, makeUrl } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'

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
      redirectToPage = urlInfo.fromPage || 'request-received'
    } else {
      // if not in custody, proceed to last known address question, even if user arrived from a recall info page (ie change link)
      redirectToPage = 'last-known-address'
    }
    valuesToSave = {
      inCustody: isInCustody,
    }
  }
  return { errors, valuesToSave, redirectToPage: makeUrl(redirectToPage, urlInfo) }
}
