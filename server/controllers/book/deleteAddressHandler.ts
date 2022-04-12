import { Request, Response } from 'express'
import { deleteLastKnownAddress } from '../../clients/manageRecallsApiClient'
import { saveErrorWithDetails } from '../utils/errorMessages'
import { makeUrl } from '../utils/makeUrl'
import { isString } from '../../utils/utils'

export const deleteAddressHandler = async (req: Request, res: Response): Promise<void> => {
  const { user, urlInfo } = res.locals
  try {
    const { recallId } = req.params
    const { deleteAddressId: lastKnownAddressId } = req.body
    if (!isString(recallId)) {
      throw new Error('Invalid recall ID')
    }
    if (!isString(lastKnownAddressId)) {
      throw new Error('Invalid lastKnownAddress ID')
    }
    await deleteLastKnownAddress(recallId, lastKnownAddressId, user.token)
    req.session.confirmationMessage = {
      text: 'The address has been deleted',
      type: 'success',
    }
  } catch (err) {
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
  } finally {
    res.redirect(303, makeUrl('address-list', urlInfo))
  }
}
