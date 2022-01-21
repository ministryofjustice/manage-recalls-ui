import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApiClient'
import logger from '../../../../logger'
import { ReqValidatorFn } from '../../../@types'

export const handleRecallFormPost =
  (validator: ReqValidatorFn, nextPageUrlSuffix: string) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    const { errors, unsavedValues, valuesToSave, redirectToPage } = validator(req.body, user)
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, req.originalUrl)
    }
    try {
      await updateRecall(recallId, valuesToSave, user.token)
      res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage || redirectToPage || nextPageUrlSuffix}`)
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
