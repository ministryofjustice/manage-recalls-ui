import { Request, Response } from 'express'
import { assignAssessingUser } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const assignAssessment = async (req: Request, res: Response): Promise<void> => {
  const { recallId } = req.params
  const { user, urlInfo } = res.locals
  try {
    await assignAssessingUser(recallId, user.uuid, user.token)
    res.redirect(303, `${urlInfo.basePath}assess`)
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
