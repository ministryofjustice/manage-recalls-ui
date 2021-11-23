import { NextFunction, Request, Response } from 'express'
import { isString } from '../routes/handlers/helpers'
import { isNomsNumberValid } from '../routes/handlers/helpers/validations'
import logger from '../../logger'

const isValidFromPage = (urlPathSegment: unknown) =>
  isString(urlPathSegment) &&
  ['missing-documents', 'check-answers', 'assess', 'dossier-recall', 'view-recall', '/'].includes(
    urlPathSegment as string
  )

export const parseUrlParams = (req: Request, res: Response, next: NextFunction) => {
  const { nomsNumber, recallId, pageSlug } = req.params
  if (!isString(nomsNumber) || !isNomsNumberValid(nomsNumber) || !isString(recallId) || !isString(pageSlug)) {
    logger.error('Invalid nomsNumber or recallId')
    return res.sendStatus(400)
  }
  const { fromPage, fromHash } = req.query
  if (fromPage && !isValidFromPage(fromPage)) {
    logger.error(`Invalid fromPage: ${fromPage}`)
    return res.redirect(req.baseUrl)
  }
  if (fromHash && !isString(fromHash)) {
    logger.error(`Invalid fromHash: ${fromHash}`)
    return res.redirect(req.baseUrl)
  }
  res.locals.urlInfo = {
    fromPage,
    fromHash,
    currentPage: pageSlug,
    basePath:
      isString(fromPage) && (fromPage as string).startsWith('/') ? '' : `/persons/${nomsNumber}/recalls/${recallId}/`,
  }
  next()
}
