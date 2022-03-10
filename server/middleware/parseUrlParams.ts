import { NextFunction, Request, Response } from 'express'
import logger from '../../logger'
import { isString } from '../utils/utils'

const isValidFromPage = (urlPathSegment: unknown) =>
  isString(urlPathSegment) &&
  ['missing-documents', 'check-answers', 'assess', 'dossier-recall', 'view-recall', '/'].includes(
    urlPathSegment as string
  )

export const parseUrlParams = (req: Request, res: Response, next: NextFunction) => {
  const { recallId, pageSlug } = req.params
  if (!isString(recallId) || !isString(pageSlug)) {
    logger.error('Invalid recallId')
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
    basePath: isString(fromPage) && (fromPage as string).startsWith('/') ? '' : `/recalls/${recallId}/`,
  }
  next()
}

export const returnToRecallListParam = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.returnToRecallList === '1') {
    res.locals.returnToRecallList = '1'
  }
  next()
}
