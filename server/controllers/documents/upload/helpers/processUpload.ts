import { Request, Response } from 'express'
import logger from '../../../../../logger'
import { uploadStorageField, uploadStorageFields } from './uploadStorage'

export const processUpload = (
  emailFieldNames: string | string[],
  req: Request,
  res: Response
): Promise<{ request: Request; uploadFailed: boolean }> => {
  return new Promise(resolve => {
    const processFn = Array.isArray(emailFieldNames)
      ? uploadStorageFields(emailFieldNames.map(name => ({ name })))
      : uploadStorageField(emailFieldNames)
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
