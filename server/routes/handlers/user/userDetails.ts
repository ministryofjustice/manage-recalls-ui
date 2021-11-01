import { Request, Response } from 'express'
import { getUserDetails, addUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from '../helpers/uploadStorage'
import { allowedImageFileExtensions } from '../helpers/allowedUploadExtensions'
import { listToString, makeErrorObject } from '../helpers'
import { AllowedUploadFileType } from '../../../@types'

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, token } = res.locals.user
    const user = await getUserDetails(uuid, token)
    res.locals.user = { ...res.locals.user, ...user }
  } catch (err) {
    if (err.status !== 404) {
      logger.info(err.message)
      res.locals.errors = {
        list: [
          {
            name: 'error',
            text: 'An error occurred fetching your details',
          },
        ],
      }
    } else {
      res.locals.errors = {
        list: [
          {
            name: 'error',
            text: 'User details not found',
          },
        ],
      }
    }
  } finally {
    res.render(`pages/userDetails`)
  }
}

export const isInvalidFileType = (file: Express.Multer.File, allowedExtensions: AllowedUploadFileType[]) => {
  return !allowedExtensions.some(ext => file.originalname.endsWith(ext.extension) && file.mimetype === ext.mimeType)
}
export const postUser = async (req: Request, res: Response): Promise<void> => {
  const { uuid, token } = res.locals.user
  const processUpload = uploadStorageField('signature')
  processUpload(req, res, async error => {
    try {
      if (error) {
        throw error
      }
      const { firstName, lastName, signatureEncoded, email, phoneNumber } = req.body
      const { file } = req
      if (isInvalidFileType(file, allowedImageFileExtensions)) {
        req.session.errors = [
          makeErrorObject({
            id: 'signature',
            text: `The selected signature image must be a ${listToString(
              allowedImageFileExtensions.map(ext => ext.label),
              'or'
            )}`,
          }),
        ]
      }
      if (!req.session.errors) {
        let signatureBase64
        if (file) {
          signatureBase64 = file.buffer.toString('base64')
        } else {
          signatureBase64 = signatureEncoded
        }
        await addUserDetails(uuid, firstName, lastName, signatureBase64, email, phoneNumber, token)
      }
    } catch (err) {
      logger.error(err)
      req.session.errors = req.session.errors || [
        {
          name: 'error',
          text: 'An error occurred saving your changes',
        },
      ]
    } finally {
      res.redirect(303, '/user-details')
    }
  })
}
