import type { Request, Response } from 'express'
import contentDisposition from 'content-disposition'

import { getWeeklyRecallsNew } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { makeErrorObject } from '../utils/errorMessages'
import { makeUrl } from '../utils/makeUrl'

export const downloadReport = async (req: Request, res: Response) => {
  const { pageSuffix } = req.query
  try {
    const {
      user: { token },
    } = res.locals
    const { fileName, mimeType, content } = await getWeeklyRecallsNew(token)
    res.contentType(mimeType)
    res.header('Content-Disposition', contentDisposition(fileName))
    res.send(content)
  } catch (err) {
    logger.error(err)
    req.session.errors = [
      makeErrorObject({
        id: `error_WEEKLY_RECALLS_NEW`,
        text: `An error occurred when creating the report. Please try downloading it again`,
      }),
    ]
    res.redirect(301, makeUrl(pageSuffix as string, res.locals.urlInfo))
  }
}
