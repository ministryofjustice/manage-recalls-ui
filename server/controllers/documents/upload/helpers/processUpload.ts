import { Request, Response } from 'express'
import logger from '../../../../../logger'
import { uploadStorageField } from './uploadStorage'

export const processUpload = (
  emailFieldName: string,
  req: Request,
  res: Response
): Promise<{ request: Request; uploadFailed: boolean }> => {
  return new Promise(resolve => {
    const processFn = uploadStorageField(emailFieldName)
    processFn(req, res, async err => {
      if (err) {
        logger.error(err)
      }
      return resolve({
        request: req,
        uploadFailed: Boolean(err),
      })
    })
  })
}
