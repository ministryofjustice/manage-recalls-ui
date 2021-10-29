import { Request, Response } from 'express'
import prometheusClient from 'prom-client'
import { getRecallList, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import { RecallResult } from '../../@types'

const timerRecallList = new prometheusClient.Summary({ name: 'recall_list_seconds', help: 'recall_list_seconds' })
const timerSearchByNomsNumber = new prometheusClient.Summary({
  name: 'search_person_seconds_total',
  help: 'search_person_seconds_total',
  labelNames: ['requests_total'],
})

export const recallList = async (req: Request, res: Response): Promise<Response | void> => {
  const { token } = res.locals.user
  const timerRecallListEnd = timerRecallList.startTimer()
  const recalls = await getRecallList(token)
  timerRecallListEnd()
  const recallsWithNomsNumbers = recalls.filter(recall => Boolean(recall.nomsNumber))
  const successful = [] as RecallResult[]
  const failed = [] as string[]
  if (recallsWithNomsNumbers.length) {
    timerSearchByNomsNumber.labels({ requests_total: recallsWithNomsNumbers.length })
    const timerSearchByNomsNumberEnd = timerSearchByNomsNumber.startTimer()
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
    timerSearchByNomsNumberEnd()
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
