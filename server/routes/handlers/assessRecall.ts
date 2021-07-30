import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from './new-recall/documentTypes'

export const assessRecall = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const [person, recall] = await Promise.all([
    searchByNomsNumber(nomsNumber as string, res.locals.user.token),
    getRecall(recallId, res.locals.user.token),
  ])
  recall.documents = recall.documents.map(doc => ({
    ...doc,
    ...(documentTypes.find(d => d.name === doc.category) || {}),
  }))
  res.locals.recall = recall
  res.locals.person = person
  res.render('pages/assessRecall')
}
