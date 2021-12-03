import { Request, Response, NextFunction } from 'express'
import logger from '../../logger'

export const requestLogging = (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user?.uuid
  const { appInsightsOperationId } = res.locals
  const sessionId = req.session.id
  const pageUrl = req.originalUrl
  logger.debug(
    JSON.stringify({
      userId,
      appInsightsOperationId,
      sessionId,
      pageUrl,
    })
  )
  next()
}
