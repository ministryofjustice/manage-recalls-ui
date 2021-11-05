import { Request, Response } from 'express'
import { performance } from 'perf_hooks'
import { buildAppInsightsClient } from '../../utils/azureAppInsights'
import { getRecallList } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResult } from '../../@types'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import { getPerson } from './helpers/personCache'
import { sortListByDateField } from './helpers/date'

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
        getPerson(recall.nomsNumber, token).then(person => {
          return <RecallResult>{
            recall,
            person,
          }
        })
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
  const completed = successful.filter(
    recallResult => recallResult.recall.status === RecallResponse.status.DOSSIER_ISSUED
  )
  res.locals.results = {
    toDo: successful.filter(recallResult => recallResult.recall.status !== RecallResponse.status.DOSSIER_ISSUED),
    completed: sortListByDateField({ list: completed, dateKey: 'recall.dossierEmailSentDate', newestFirst: true }),
  }
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
