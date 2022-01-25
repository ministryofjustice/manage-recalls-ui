import { NextFunction, Request, Response } from 'express'
import { getAddressesByPostcode } from '../../../clients/osPlacesApiClient'
import { validateFindAddress } from './helpers/validateFindAddress'
import { makeErrorObject } from '../helpers'
import { makeUrl } from '../../../utils/nunjucksFunctions'

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
    res.locals.postcode = postcode
    const addresses = await getAddressesByPostcode(valuesToSave.postcode)
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
