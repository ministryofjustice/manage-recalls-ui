import { Request, Response } from 'express'
import { performance } from 'perf_hooks'
import { buildAppInsightsClient } from '../../utils/azureAppInsights'
import { getRecallList } from '../../clients/manageRecallsApiClient'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import logger from '../../../logger'
import { sortCompletedList, sortNotInCustodyList, sortToDoList } from './helpers/dates/sort'
import { formatName } from './helpers'

export const recallList = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const appInsightsClient = buildAppInsightsClient()
    const { token } = res.locals.user
    const start = performance.now()
    const recalls = await getRecallList(token)
    appInsightsClient?.trackMetric({ name: 'getRecallList', value: Math.round(performance.now() - start) })
    const recallsWithNomsNumbers = recalls.filter(recall => Boolean(recall.nomsNumber))
    const successful = [] as RecallResponse[]
    const failed = [] as string[]
    if (recallsWithNomsNumbers.length) {
      const start2 = performance.now()
      const results = await Promise.allSettled(
        recallsWithNomsNumbers.map(recall => ({
          ...recall,
          fullName: formatName({
            category: recall.licenceNameCategory,
            recall,
          }),
        }))
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
    const toDoList = [] as RecallResponse[]
    const completed = [] as RecallResponse[]
    const notInCustody = [] as RecallResponse[]
    successful.forEach(recall => {
      if ([RecallResponse.status.DOSSIER_ISSUED, RecallResponse.status.STOPPED].includes(recall.status)) {
        completed.push(recall)
      } else if (
        recall.status === RecallResponse.status.AWAITING_RETURN_TO_CUSTODY ||
        (recall.status === RecallResponse.status.RECALL_NOTIFICATION_ISSUED && recall.inCustody === false)
      ) {
        notInCustody.push(recall)
      } else {
        toDoList.push(recall)
      }
    })
    res.locals.results = {
      toDo: sortToDoList(toDoList),
      completed: sortCompletedList(completed),
      notInCustody: sortNotInCustodyList(notInCustody),
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
