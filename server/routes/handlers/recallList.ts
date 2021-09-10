import { Request, Response } from 'express'
import { getRecallList, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResult } from '../../@types'

export const recallList = async (req: Request, res: Response): Promise<Response | void> => {
  const { token } = res.locals.user
  const recalls = await getRecallList(token)
  const recallsWithNomsNumbers = recalls.filter(recall => Boolean(recall.nomsNumber))
  const successful = [] as RecallResult[]
  const failed = [] as string[]
  if (recallsWithNomsNumbers.length) {
    const results = await Promise.allSettled(
      recallsWithNomsNumbers.map(recall =>
        searchByNomsNumber(recall.nomsNumber, token).then(
          person =>
            <RecallResult>{
              recallId: recall.recallId,
              status: recall.status,
              offender: person,
            }
        )
      )
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
