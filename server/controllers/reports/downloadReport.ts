import type { NextFunction, Request, Response } from 'express'
import contentDisposition from 'content-disposition'

import { getWeeklyRecallsNew } from '../../clients/manageRecallsApiClient'

export const downloadReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      user: { token },
    } = res.locals
    const { fileName, mimeType, content } = await getWeeklyRecallsNew(token)
    res.contentType(mimeType)
    res.header('Content-Disposition', contentDisposition(fileName))
    res.send(content)
  } catch (err) {
    next(err)
  }
}
