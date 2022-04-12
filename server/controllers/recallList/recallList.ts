import { NextFunction, Request, Response } from 'express'
import { performance } from 'perf_hooks'
import { buildAppInsightsClient } from '../../monitoring/azureAppInsights'
import { getRecallList } from '../../clients/manageRecallsApiClient'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import {
  sortAwaitingPartBList,
  sortCompletedList,
  sortDossierCheckList,
  sortNotInCustodyList,
  sortToDoList,
} from '../utils/dates/sort'
import { formatPersonName } from '../utils/person'
import { RecallResponseLite } from '../../@types/manage-recalls-api/models/RecallResponseLite'

export const recallList = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const appInsightsClient = buildAppInsightsClient()
    const { token } = res.locals.user
    const start = performance.now()
    const recalls = await getRecallList(token)
    appInsightsClient?.trackMetric({ name: 'getRecallList', value: Math.round(performance.now() - start) })
    const successful = [] as RecallResponseLite[]
    const failed = [] as string[]
    if (recalls.length) {
      const start2 = performance.now()
      const results = await Promise.allSettled(
        recalls.map(recall => ({
          ...recall,
          fullName: formatPersonName({
            category: recall.licenceNameCategory,
            recall,
          }),
        }))
      )
      appInsightsClient?.trackMetric({
        name: 'searchByNomsNumber_total',
        value: Math.round(performance.now() - start2),
      })
      appInsightsClient?.trackMetric({ name: 'searchByNomsNumber_call_count', value: recalls.length })
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push(recalls[idx].nomsNumber)
        }
      })
    }
    const toDoList = [] as RecallResponseLite[]
    const completed = [] as RecallResponseLite[]
    const notInCustody = [] as RecallResponseLite[]
    const awaitingPartB = [] as RecallResponseLite[]
    const dossierCheck = [] as RecallResponseLite[]
    successful.forEach(recall => {
      if ([RecallResponse.status.DOSSIER_ISSUED, RecallResponse.status.STOPPED].includes(recall.status)) {
        completed.push(recall)
      } else if (
        [RecallResponse.status.ASSESSED_NOT_IN_CUSTODY, RecallResponse.status.AWAITING_RETURN_TO_CUSTODY].includes(
          recall.status
        )
      ) {
        notInCustody.push(recall)
      } else if (recall.status === RecallResponse.status.AWAITING_PART_B) {
        awaitingPartB.push(recall)
      } else if (
        [
          RecallResponse.status.AWAITING_SECONDARY_DOSSIER_CREATION,
          RecallResponse.status.SECONDARY_DOSSIER_IN_PROGRESS,
        ].includes(recall.status)
      ) {
        dossierCheck.push(recall)
      } else {
        toDoList.push(recall)
      }
    })
    res.locals.results = {
      toDo: sortToDoList(toDoList),
      completed: sortCompletedList(completed),
      notInCustody: sortNotInCustodyList(notInCustody),
      awaitingPartB: sortAwaitingPartBList(awaitingPartB),
      dossierCheck: sortDossierCheckList(dossierCheck),
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
  } catch (err) {
    next(err)
  }
}
