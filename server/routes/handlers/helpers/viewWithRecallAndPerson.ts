import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from '../book/documentTypes'
import { getFormattedRecallLength, isInvalid } from './index'

export type ViewName = 'assessConfirmation' | 'assessDecision' | 'assessRecall' | 'recallType' | 'recallRequestReceived'

export const viewWithRecallAndPerson =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [person, recall] = await Promise.all([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
    ])
    recall.documents = recall.documents.map(doc => ({
      ...doc,
      ...(documentTypes.find(d => d.name === doc.category) || {}),
    }))
    res.locals.recall = recall
    if (recall.recallLength) {
      res.locals.recall.recallLengthFormatted = getFormattedRecallLength(recall.recallLength)
    }
    res.locals.person = person
    res.render(`pages/${viewName}`)
  }
