import { Request, Response } from 'express'
import { getServiceMetrics } from '../../clients/manageRecallsApiClient'
import { processPhaseTimings } from './helpers'

export const serviceMetricsDashboard = async (req: Request, res: Response): Promise<Response | void> => {
  const { user } = res.locals
  const metrics = await getServiceMetrics(user.token)
  const processed = processPhaseTimings(metrics)
  res.locals = { ...res.locals, timingAveragesSec: processed }
  res.render('pages/serviceMetricsDashboard')
}
