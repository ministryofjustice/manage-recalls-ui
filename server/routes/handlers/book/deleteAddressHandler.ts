import { Request, Response } from 'express'
import { deleteLastKnownAddress } from '../../../clients/manageRecallsApiClient'
import { saveErrorObject } from '../helpers/errorMessages'
import { isString } from '../helpers'
import { makeUrl } from '../../../utils/nunjucksFunctions'

export const deleteAddressHandler = async (req: Request, res: Response): Promise<void> => {
  const { recallId } = req.params
  const { deleteAddressId: lastKnownAddressId } = req.body
  if (!isString(recallId)) {
    throw new Error('Invalid recall ID')
  }
  if (!isString(lastKnownAddressId)) {
    throw new Error('Invalid lastKnownAddress ID')
  }
  const { user, urlInfo } = res.locals
  try {
    await deleteLastKnownAddress(recallId, lastKnownAddressId, user.token)
    res.redirect(303, makeUrl('address-list', urlInfo))
  } catch (err) {
    req.session.errors = [saveErrorObject]
    res.redirect(303, makeUrl('address-list', urlInfo))
  }
}