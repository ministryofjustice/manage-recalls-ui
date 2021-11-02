import { Request, Response } from 'express'
import { assignUserToRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const assignUser =
  ({ nextPageUrlSuffix }: { nextPageUrlSuffix: string }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    try {
      await assignUserToRecall(recallId, user.uuid, user.token)
      res.redirect(303, `${urlInfo.basePath}${nextPageUrlSuffix}`)
    } catch (err) {
      req.session.errors = [
        {
          name: 'saveError',
          text: 'An error occurred assigning you to the recall assessment',
        },
      ]
      res.redirect(303, '/')
    }
  }
