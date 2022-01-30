import { makeErrorObject, makeUrl } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'

export const validateConfirmCustodyStatus = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
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
      redirectToPage = 'assess-prison'
    } else {
      redirectToPage = 'assess-download'
    }
    valuesToSave = {
      inCustody: isInCustody,
    }
  }
  return { errors, valuesToSave, redirectToPage: makeUrl(urlInfo.fromPage || redirectToPage, urlInfo) }
}
