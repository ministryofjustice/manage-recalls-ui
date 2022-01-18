import { makeErrorObject } from '../../helpers'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'

export const validateCustodyStatus = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
  let errors
  let valuesToSave
  let redirectToPage

  const { inCustody, hasMiddleNames } = requestBody
  if (!inCustody || !['YES', 'NO'].includes(inCustody)) {
    errors = [
      makeErrorObject({
        id: 'inCustody',
        text: 'Is {{ recall.fullName }} in custody?',
      }),
    ]
  }
  if (!errors) {
    redirectToPage = hasMiddleNames ? 'licence-name' : 'pre-cons-name'
    valuesToSave = {
      inCustody: inCustody === 'YES',
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
