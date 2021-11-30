import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'
import { buildAppInsightsClient } from '../utils/azureAppInsights'

export const appInsightsOperationId = (req: Request, res: Response, next: NextFunction) => {
  const appInsightsClient = buildAppInsightsClient()
  res.locals.appInsightsOperationId = appInsightsClient ? appInsightsClient.context.keys.operationId : undefined
  Sentry.setContext('appInsightsOperationId', { appInsightsOperationId: res.locals.appInsightsOperationId })
  next()
}
