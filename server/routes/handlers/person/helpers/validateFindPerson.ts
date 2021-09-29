import { isDefined, isString, makeErrorObject } from '../../helpers'
import { isNomsNumberValid } from '../../helpers/validations'

export const validateFindPerson = (nomsNumber?: string) => {
  let errors
  if (isDefined(nomsNumber)) {
    if (!isString(nomsNumber) || !isNomsNumberValid((nomsNumber as string).trim())) {
      let errorMsgForField = 'Enter a NOMIS number'
      if (nomsNumber !== '' && isString(nomsNumber) && !isNomsNumberValid((nomsNumber as string).trim())) {
        errorMsgForField = `"${nomsNumber}" is not a valid NOMIS number`
      }
      errors = [
        makeErrorObject({
          id: 'nomsNumber',
          text: 'NOMIS number',
          values: nomsNumber as string,
          errorMsgForField,
        }),
      ]
    }
  }
  return errors
}
