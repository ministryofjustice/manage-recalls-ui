import { makeErrorObject } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { makeUrl } from '../../helpers/makeUrl'

export const validateConfirmCustodyStatus = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave
  let redirectToPage

  const { inCustodyAtAssessment } = requestBody
  if (!inCustodyAtAssessment || !['YES', 'NO'].includes(inCustodyAtAssessment)) {
    errors = [
      makeErrorObject({
        id: 'inCustodyAtAssessment',
        text: 'Is {{ recall.fullName }} in custody?',
      }),
    ]
  }
  if (!errors) {
    const isInCustody = inCustodyAtAssessment === 'YES'
    if (isInCustody) {
      redirectToPage = 'assess-prison'
    } else {
      redirectToPage = 'assess-download'
    }
    valuesToSave = {
      inCustodyAtAssessment: isInCustody,
    }
  }
  return { errors, valuesToSave, redirectToPage: makeUrl(redirectToPage, urlInfo) }
}
