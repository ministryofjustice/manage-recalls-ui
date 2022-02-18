import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'

export const validateCustodyStatus = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave
  let redirectToPage

  const { inCustodyAtBooking } = requestBody
  if (!inCustodyAtBooking || !['YES', 'NO'].includes(inCustodyAtBooking)) {
    errors = [
      makeErrorObject({
        id: 'inCustodyAtBooking',
        text: 'Is {{ recall.fullName }} in custody?',
      }),
    ]
  }
  if (!errors) {
    const isInCustody = inCustodyAtBooking === 'YES'
    if (isInCustody) {
      redirectToPage = urlInfo.fromPage
        ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
        : makeUrl('request-received', urlInfo)
    } else {
      // if not in custody, proceed to last known address question, even if user arrived from a recall info page (ie change link)
      redirectToPage = makeUrl('last-known-address', urlInfo)
    }
    valuesToSave = {
      inCustodyAtBooking: isInCustody,
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
