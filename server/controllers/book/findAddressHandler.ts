import { NextFunction, Request, Response } from 'express'
import { getAddressesByPostcode } from '../../clients/osPlacesApiClient'
import { validateFindAddress } from './validators/validateFindAddress'
import { makeUrl } from '../utils/makeUrl'
import { makeErrorObject } from '../utils/errorMessages'

export const findAddressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { postcode } = req.query
  const { urlInfo } = res.locals
  const reloadOnError = () => res.redirect(303, makeUrl('postcode-lookup', urlInfo))

  try {
    const { errors, unsavedValues, valuesToSave } = validateFindAddress(postcode)
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return reloadOnError()
    }
    res.locals.postcode = valuesToSave.postcode
    const addresses = await getAddressesByPostcode(valuesToSave.postcode)
    if (addresses.length === 0) {
      req.session.errors = [makeErrorObject({ id: 'postcode', text: 'No matching post code found' })]
      req.session.unsavedValues = { postcode: valuesToSave.postcode }
      return reloadOnError()
    }
    res.locals.addresses = addresses.map(address => ({
      value: address.uprn,
      text: address.address,
    }))
    next()
  } catch (err) {
    req.session.errors = [
      makeErrorObject({
        id: 'postcode',
        text: 'An error occurred searching for the postcode',
      }),
    ]
    reloadOnError()
  }
}
