import { Request, Response } from 'express'
import { assignUserToRecall } from '../../clients/manageRecallsApiClient'
import { saveErrorWithDetails } from '../utils/errorMessages'

export const assignUser =
  ({ nextPageUrlSuffix }: { nextPageUrlSuffix: string }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    try {
      await assignUserToRecall(recallId, user.uuid, user.token)
      res.redirect(303, `${urlInfo.basePath}${nextPageUrlSuffix}`)
    } catch (err) {
      req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
      res.redirect(303, '/')
    }
  }
