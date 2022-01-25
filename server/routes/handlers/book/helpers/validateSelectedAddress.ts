import { makeErrorObject } from '../../helpers'
import { NamedFormError } from '../../../../@types'

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
