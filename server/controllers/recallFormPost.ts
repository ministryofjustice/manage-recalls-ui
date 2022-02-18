import { Request, Response } from 'express'
import { updateRecall } from '../clients/manageRecallsApiClient'
import logger from '../../logger'
import { ReqValidatorFn, User } from '../@types'

export interface SaveToApiFnArgs {
  recallId: string
  valuesToSave: unknown
  user: User
}
export type SaveToApiFn = ({ recallId, valuesToSave, user }: SaveToApiFnArgs) => Promise<unknown>

export const recallFormPost =
  (validator: ReqValidatorFn, saveToApiFn?: SaveToApiFn) =>
  async (req: Request, res: Response): Promise<void> => {
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
    try {
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
      req.session.errors = [
        {
          name: 'saveError',
          text: 'An error occurred saving your changes',
        },
      ]
      res.redirect(303, req.originalUrl)
    }
  }
