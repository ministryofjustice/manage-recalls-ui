import { NextFunction, Request, Response } from 'express'
import { getCurrentUserDetails } from '../clients/manageRecallsApiClient'
import logger from '../../logger'

export const checkUserDetailsExist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = res.locals.user
    await getCurrentUserDetails(token)
    next()
  } catch (err) {
    if (err.data?.status === 'NOT_FOUND') {
      logger.info(err.data?.reason, `Error retrieving user details from manage-recalls-api`)
      return res.redirect('/user-details')
    }
    next()
  }
}
