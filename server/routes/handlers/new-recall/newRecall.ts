import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const newRecall = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const [person, recall] = await Promise.all([
    searchByNomsNumber(nomsNumber as string, res.locals.user.token),
    getRecall(recallId, res.locals.user.token),
  ])
  res.locals.offender = person
  res.locals.recall = recall
  res.render('pages/newRecall')
}
