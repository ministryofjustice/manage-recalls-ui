import { NamedFormError, ObjectMap } from '../../../@types'
import { isPostcodeValid, normalisePostcode } from '../../utils/validate-formats'
import { CreateLastKnownAddressRequest } from '../../../@types/manage-recalls-api/models/CreateLastKnownAddressRequest'
import { makeErrorObject } from '../../utils/errorMessages'
import { isEmptyString, isString } from '../../../utils/utils'

export const validateAddressManual = (
  recallId: string,
  requestBody: ObjectMap<string>
): {
  errors?: NamedFormError[]
  valuesToSave?: CreateLastKnownAddressRequest
  unsavedValues?: ObjectMap<unknown>
} => {
  let errors: NamedFormError[]
  let valuesToSave
  let unsavedValues

  const {
    line1: line1Unprocessed,
    line2: line2Unprocessed,
    town: townUnprocessed,
    postcode: postcodeUnprocessed,
  } = requestBody
  const line1 = line1Unprocessed?.trim().toUpperCase()
  const line2 = line2Unprocessed?.trim().toUpperCase()
  const town = townUnprocessed?.trim().toUpperCase()

  const postcode = isString(postcodeUnprocessed) ? normalisePostcode(postcodeUnprocessed) : undefined
  // check again if it's an empty string as spaces have been removed
  const postcodeValid = isString(postcode) && !isEmptyString(postcode) ? isPostcodeValid(postcode) : true
  if (!line1 || !town || !postcodeValid) {
    errors = []
    if (!line1) {
      errors.push(
        makeErrorObject({
          id: 'line1',
          text: 'Enter an address line 1',
        })
      )
    }
    if (!town) {
      errors.push(
        makeErrorObject({
          id: 'town',
          text: 'Enter a town or city',
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
      line1,
      line2,
      town,
      postcode: postcodeValid ? postcode : postcodeUnprocessed,
    }
  }
  if (!errors) {
    valuesToSave = {
      recallId,
      line1,
      line2,
      town,
      postcode,
      source: CreateLastKnownAddressRequest.source.MANUAL,
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
