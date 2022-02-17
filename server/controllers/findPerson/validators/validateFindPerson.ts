import { isNomsNumberValid } from '../../utils/validate-formats'
import { makeErrorObject } from '../../utils/errorMessages'
import { isDefined, isString } from '../../../utils/utils'

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
