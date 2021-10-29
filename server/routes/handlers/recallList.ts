import { Request, Response } from 'express'
import { buildAppInsightsClient } from '../../utils/azureAppInsights'
import { getRecallList, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResult } from '../../@types'

export const recallList = async (req: Request, res: Response): Promise<Response | void> => {
  const appInsightsClient = buildAppInsightsClient()
  const { token } = res.locals.user
  const start = performance.now()
  const recalls = await getRecallList(token)
  appInsightsClient?.trackMetric({ name: 'getRecallList', value: Math.round(performance.now() - start) })
  const recallsWithNomsNumbers = recalls.filter(recall => Boolean(recall.nomsNumber))
  const successful = [] as RecallResult[]
  const failed = [] as string[]
  if (recallsWithNomsNumbers.length) {
    const start2 = performance.now()
    const results = await Promise.allSettled(
      recallsWithNomsNumbers.map(recall =>
        searchByNomsNumber(recall.nomsNumber, token).then(
          person =>
            <RecallResult>{
              recall,
              person,
            }
        )
      )
    )
    appInsightsClient?.trackMetric({ name: 'searchByNomsNumber_total', value: Math.round(performance.now() - start2) })
    appInsightsClient?.trackMetric({ name: 'searchByNomsNumber_call_count', value: recallsWithNomsNumbers.length })
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value)
      } else {
        failed.push(recalls[idx].nomsNumber)
      }
    })
  }
  res.locals.results = successful
  if (failed.length) {
    res.locals.errors = res.locals.errors || []
    res.locals.errors.push({
      name: 'fetchError',
      text: `${failed.length} recalls could not be retrieved`,
    })
  }
  res.locals.isTodoPage = true
  res.render('pages/recallList')
}
