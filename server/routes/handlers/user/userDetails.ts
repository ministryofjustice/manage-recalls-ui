import { Request, Response } from 'express'
import { getUserDetails, addUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from '../helpers/uploadStorage'

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
      let signatureBase64
      if (file) {
        signatureBase64 = file.buffer.toString('base64')
      } else {
        signatureBase64 = signatureEncoded
      }
      await addUserDetails(uuid, firstName, lastName, signatureBase64, email, phoneNumber, token)
    } catch (err) {
      logger.error(err)
      req.session.errors = [
        {
          name: 'error',
          text: 'An error occurred saving your changes',
        },
      ]
    } finally {
      res.redirect('/user-details')
    }
  })
}
