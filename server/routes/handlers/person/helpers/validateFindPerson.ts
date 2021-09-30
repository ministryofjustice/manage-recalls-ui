import { isDefined, isString, makeErrorObject } from '../../helpers'
import { isNomsNumberValid } from '../../helpers/validations'

export const validateFindPerson = (nomsNumber?: string) => {
  let errors
  if (isDefined(nomsNumber)) {
    if (!isString(nomsNumber) || !isNomsNumberValid((nomsNumber as string).trim())) {
      let text = 'Enter a NOMIS number'
      if (nomsNumber !== '' && isString(nomsNumber) && !isNomsNumberValid((nomsNumber as string).trim())) {
        text = 'Enter a NOMIS number in the correct format'
      }
      errors = [
        makeErrorObject({
          id: 'nomsNumber',
          text,
          values: nomsNumber as string,
        }),
      ]
    }
  }
  return errors
}
