import { NamedFormError } from '../../../@types'
import { makeErrorObject } from '../../utils/errorMessages'

export const validateSelectedAddress = (
  addressUprn: string
): {
  errors?: NamedFormError[]
  valuesToSave?: { addressUprn: string }
} => {
  let errors: NamedFormError[]
  let valuesToSave

  if (!addressUprn) {
    errors = [
      makeErrorObject({
        id: 'addressUprn',
        text: 'Select an address',
      }),
    ]
  }
  if (!errors) {
    valuesToSave = {
      addressUprn,
    }
  }
  return { errors, valuesToSave }
}
