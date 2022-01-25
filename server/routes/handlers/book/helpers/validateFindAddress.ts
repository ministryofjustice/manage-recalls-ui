import { ParsedQs } from 'qs'
import { makeErrorObject, isString, isEmptyString } from '../../helpers'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isPostcodeValid, normalisePostcode } from '../../helpers/validations'

export const validateFindAddress = (
  postcodeUnprocessed: string | ParsedQs | string[] | ParsedQs[]
): {
  errors?: NamedFormError[]
  valuesToSave?: { postcode: string }
  unsavedValues?: ObjectMap<unknown>
} => {
  let errors: NamedFormError[]
  let valuesToSave
  let unsavedValues

  const postcode = isString(postcodeUnprocessed) ? normalisePostcode(postcodeUnprocessed as string) : undefined
  // check again if it's an empty string as spaces have been removed
  const postcodeValid = isString(postcode) && !isEmptyString(postcode) ? isPostcodeValid(postcode) : true
  if (!postcode || !postcodeValid) {
    errors = []
    if (!postcode) {
      errors.push(
        makeErrorObject({
          id: 'postcode',
          text: 'Enter a postcode',
        })
      )
    }
    if (!postcodeValid) {
      errors.push(
        makeErrorObject({
          id: 'postcode',
          text: 'Enter a postcode in the correct format, like SW1H 9AJ',
        })
      )
    }
    unsavedValues = {
      postcode: postcodeValid ? postcode : postcodeUnprocessed,
    }
  }
  if (!errors) {
    valuesToSave = {
      postcode,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
