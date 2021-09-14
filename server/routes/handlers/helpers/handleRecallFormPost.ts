import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { ReqValidatorFn } from '../../../@types'

export const handleRecallFormPost =
  (validator: ReqValidatorFn, nextPageUrlSuffix: string) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    if (!nomsNumber || !recallId) {
      logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
      res.sendStatus(400)
      return
    }
    const { errors, unsavedValues, valuesToSave } = validator(req.body)
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, req.originalUrl)
    }
    try {
      const recall = await updateRecall(recallId, valuesToSave, res.locals.user.token)
      res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/${nextPageUrlSuffix}`)
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
