import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export const assessRecall = async (req: Request, res: Response): Promise<Response> | undefined => {
  const { recallId } = req.query
  if (recallId && typeof recallId !== 'string') {
    return res.send(400)
  }
  if (recallId) {
    const recall = await getRecall(recallId as string, res.locals.user.token)
    res.locals.recall = recall
    res.locals.offender = await searchByNomsNumber(recall.nomsNumber as string, res.locals.user.token)
  }
  res.locals.recallId = recallId
  res.locals.isTodoPage = true
  res.render('pages/assessRecall')
}
