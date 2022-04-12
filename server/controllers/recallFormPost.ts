import { Request, Response } from 'express'
import { updateRecall } from '../clients/manageRecallsApiClient'
import logger from '../../logger'
import { ReqValidatorFn, SaveToApiFn } from '../@types'
import { saveErrorWithDetails } from './utils/errorMessages'

export const recallFormPost =
  (validator: ReqValidatorFn, saveToApiFn?: SaveToApiFn) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { recallId } = req.params
      const { user, urlInfo } = res.locals
      const { errors, unsavedValues, valuesToSave, redirectToPage, confirmationMessage } = validator({
        requestBody: req.body,
        urlInfo,
        user,
      })
      if (errors) {
        req.session.errors = errors
        req.session.unsavedValues = unsavedValues
        return res.redirect(303, req.originalUrl)
      }
      if (saveToApiFn) {
        await saveToApiFn({ recallId, valuesToSave, user })
      } else {
        await updateRecall(recallId, valuesToSave, user.token)
      }
      if (confirmationMessage) {
        req.session.confirmationMessage = confirmationMessage
      }
      res.redirect(303, redirectToPage)
    } catch (err) {
      logger.error(err)
      req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
      res.redirect(303, req.originalUrl)
    }
  }
