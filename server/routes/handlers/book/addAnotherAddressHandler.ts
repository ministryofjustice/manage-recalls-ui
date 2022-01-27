import { Request, Response } from 'express'
import { validateAddAnotherAddress } from './helpers/validateAddAnotherAddress'
import { makeUrl } from '../helpers'

export const addAnotherAddressHandler = async (req: Request, res: Response): Promise<void> => {
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
