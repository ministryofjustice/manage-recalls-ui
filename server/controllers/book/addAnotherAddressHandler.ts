import { NextFunction, Request, Response } from 'express'
import { validateAddAnotherAddress } from './validators/validateAddAnotherAddress'
import { makeUrl } from '../utils/makeUrl'

export const addAnotherAddressHandler = (req: Request, res: Response, next: NextFunction) => {
  const { addAnotherAddressOption } = req.body
  const { urlInfo } = res.locals

  const { errors, unsavedValues, redirectToPage } = validateAddAnotherAddress({ addAnotherAddressOption, urlInfo })
  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, makeUrl('address-list', urlInfo))
  }
  res.redirect(303, redirectToPage)
}
