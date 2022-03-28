import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateConfirmCustodyStatus = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave
  let redirectToPage

  const { inCustodyAtAssessment } = requestBody
  if (!inCustodyAtAssessment || !['YES', 'NO'].includes(inCustodyAtAssessment)) {
    errors = [
      makeErrorObject({
        id: 'inCustodyAtAssessment',
        text: 'Is <span data-private>{{ recall.fullName }}</span> in custody?',
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
