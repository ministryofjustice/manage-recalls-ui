import { NextFunction, Request, Response } from 'express'
import { getServiceMetrics } from '../../clients/manageRecallsApiClient'
import { processPhaseTimings } from './helpers'

export const serviceMetricsDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { user } = res.locals
    const metrics = await getServiceMetrics(user.token)
    const processed = processPhaseTimings(metrics)
    res.locals = { ...res.locals, timingAveragesSec: processed }
    res.locals.isStatisticsPage = true
    res.render('pages/serviceMetricsDashboard')
  } catch (err) {
    next(err)
  }
}
