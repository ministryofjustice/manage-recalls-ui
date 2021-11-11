import { Request, Response } from 'express'
import { performance } from 'perf_hooks'
import { buildAppInsightsClient } from '../../utils/azureAppInsights'
import { getRecallList } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResult } from '../../@types'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import { getPerson } from './helpers/personCache'
import logger from '../../../logger'
import { sortCompletedList, sortToDoList } from './helpers/dates/sort'

export const recallList = async (req: Request, res: Response): Promise<Response | void> => {
  try {
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
          getPerson(recall.nomsNumber, token).then(
            person =>
              <RecallResult>{
                recall,
                person,
              }
          )
        )
      )
      appInsightsClient?.trackMetric({
        name: 'searchByNomsNumber_total',
        value: Math.round(performance.now() - start2),
      })
      appInsightsClient?.trackMetric({ name: 'searchByNomsNumber_call_count', value: recallsWithNomsNumbers.length })
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push(recalls[idx].nomsNumber)
        }
      })
    }
    const toDoList = [] as RecallResult[]
    const completed = [] as RecallResult[]
    successful.forEach(recallResult => {
      if ([RecallResponse.status.DOSSIER_ISSUED, RecallResponse.status.STOPPED].includes(recallResult.recall.status)) {
        completed.push(recallResult)
      } else {
        toDoList.push(recallResult)
      }
    })
    res.locals.results = {
      toDo: sortToDoList(toDoList),
      completed: sortCompletedList(completed),
    }
    if (failed.length) {
      res.locals.errors = res.locals.errors || []
      res.locals.errors.push({
        name: 'fetchError',
        text: `${failed.length} recalls could not be retrieved`,
      })
    }
  } catch (err) {
    logger.error(err)
    res.locals.errors = res.locals.errors || []
    res.locals.errors.push({
      name: 'fetchError',
      text: 'Recalls could not be retrieved',
    })
  } finally {
    res.locals.isTodoPage = true
    res.render('pages/recallList')
  }
}
