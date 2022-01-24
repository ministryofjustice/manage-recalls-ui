import { makeErrorObject } from '../../helpers'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'

export const validateCustodyStatus = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
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
    if (!isInCustody) {
      redirectToPage = 'last-known-address'
    }
    valuesToSave = {
      inCustody: isInCustody,
    }
  }
  return { errors, valuesToSave, redirectToPage }
}
