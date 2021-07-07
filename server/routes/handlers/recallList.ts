import { NextFunction, Request, Response } from 'express'
import {
  getRecallList,
  PrisonerSearchResult,
  searchByNomsNumber,
} from '../../clients/manageRecallsApi/manageRecallsApiClient'

export const recallList = async (req: Request, res: Response, _next: NextFunction): Promise<Response | void> => {
  const { token } = res.locals.user
  const recalls = await getRecallList(token)
  const recallsWithNomsNumbers = recalls.filter(recall => Boolean(recall.nomsNumber))
  const successful = [] as PrisonerSearchResult[]
  const failed = [] as string[]
  if (recallsWithNomsNumbers.length) {
    const results = await Promise.allSettled(
      recallsWithNomsNumbers.map(recall => searchByNomsNumber(recall.nomsNumber, token))
    )
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value)
      } else {
        failed.push(recalls[idx].nomsNumber)
      }
    })
  }
  res.locals.recalls = successful
  // TODO - report to user that some recalls couldn't be retrieved
  res.locals.errors = failed
  res.locals.isTodoPage = true
  res.render('pages/recallList')
}
