import { NextFunction, Request, Response } from 'express'
import { isString } from '../routes/handlers/helpers'
import { isNomsNumberValid } from '../routes/handlers/helpers/validations'
import logger from '../../logger'

const isValidFromPage = (urlPathSegment: unknown) =>
  isString(urlPathSegment) && ['check-answers'].includes(urlPathSegment as string)

export const parseUrlParams = (req: Request, res: Response, next: NextFunction) => {
  const { nomsNumber, recallId } = req.params
  if (!isString(nomsNumber) || !isNomsNumberValid(nomsNumber) || !isString(recallId)) {
    logger.error('Invalid nomsNumber or recallId')
    return res.sendStatus(400)
  }
  const { fromPage } = req.query
  if (fromPage && !isValidFromPage(fromPage)) {
    return res.redirect(req.path)
  }
  res.locals.urlInfo = {
    fromPage,
    basePath: `/persons/${nomsNumber}/recalls/${recallId}/`,
  }
  next()
}
