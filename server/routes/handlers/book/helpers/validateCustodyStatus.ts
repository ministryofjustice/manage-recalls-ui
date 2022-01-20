import { makeErrorObject } from '../../helpers'
import { ObjectMap, ReqValidatorReturn } from '../../../../@types'

export const validateCustodyStatus = (requestBody: ObjectMap<string>): ReqValidatorReturn => {
  let errors
  let valuesToSave

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
    valuesToSave = {
      inCustody: inCustody === 'YES',
    }
  }
  return { errors, valuesToSave }
}
