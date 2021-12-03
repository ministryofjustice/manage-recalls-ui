import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import { getCurrentUserDetails } from '../clients/manageRecallsApi/manageRecallsApiClient'

export const populateCurrentUser = (userService: UserService): RequestHandler => {
  return async (req, res, next) => {
    if (res.locals.user) {
      const { token } = res.locals.user
      const [userServiceResponse, recallsApiUserResponse] = await Promise.allSettled([
        userService.getUser(token),
        getCurrentUserDetails(token),
      ])

      if (userServiceResponse.status === 'rejected') {
        logger.error(userServiceResponse.reason, `Failed to retrieve user`)
      } else {
        res.locals.user = { ...userServiceResponse.value, ...res.locals.user }
      }
      if (recallsApiUserResponse.status === 'rejected') {
        if (recallsApiUserResponse.reason.status !== 404) {
          logger.error(recallsApiUserResponse.reason, `Error retrieving user details from manage-recalls-api`)
        }
        if (req.url !== '/user-details') {
          return res.redirect('/user-details')
        }
      } else if (recallsApiUserResponse.status === 'fulfilled') {
        res.locals.user = { ...res.locals.user, ...recallsApiUserResponse.value }
      }
    }
    next()
  }
}
