import { Request, Response } from 'express'
import { addLastKnownAddress } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { validateAddressManual } from './validators/validateAddressManual'
import { saveErrorObject } from '../utils/errorMessages'
import { makeUrl } from '../utils/makeUrl'
import { isString } from '../../utils/utils'

export const addLastKnownAddressHandler = async (req: Request, res: Response): Promise<void> => {
  const { recallId } = req.params
  if (!isString(recallId)) {
    throw new Error('Invalid recall ID')
  }
  const { user, urlInfo } = res.locals
  const { errors, unsavedValues, valuesToSave } = validateAddressManual(recallId, req.body)
  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return res.redirect(303, req.originalUrl)
  }
  try {
    await addLastKnownAddress(valuesToSave, user.token)
    res.redirect(303, makeUrl('address-list', urlInfo))
  } catch (err) {
    logger.error(err)
    req.session.errors = [saveErrorObject]
    res.redirect(303, req.originalUrl)
  }
}
