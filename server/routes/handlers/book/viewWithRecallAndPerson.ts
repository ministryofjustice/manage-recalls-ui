import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const isInvalid = (value: string): boolean => {
  return !value || (value && typeof value !== 'string')
}

export const viewWithRecallAndPerson = async (req: Request, res: Response, view: string): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    res.sendStatus(400)
    return
  }

  const [person, recall] = await Promise.all([
    searchByNomsNumber(nomsNumber as string, res.locals.user.token),
    getRecall(recallId, res.locals.user.token),
  ])
  res.locals.person = person
  res.locals.recall = recall
  res.render(view)
}
