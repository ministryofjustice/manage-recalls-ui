import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import { getCurrentUserDetails } from '../clients/manageRecallsApi/manageRecallsApiClient'

export const populateCurrentUser = (userService: UserService): RequestHandler => {
  return async (req, res, next) => {
    if (res.locals.user) {
      const { token } = res.locals.user
      const isUserDetailsPage = req.url.startsWith('/user-details')
      const [userServiceResponse, recallsApiUserResponse] = await Promise.allSettled([
        userService.getUser(token),
        !isUserDetailsPage ? getCurrentUserDetails(token) : undefined,
      ])

      if (userServiceResponse.status === 'rejected') {
        logger.error(userServiceResponse.reason, `Failed to retrieve user`)
      } else {
        res.locals.user = { ...userServiceResponse.value, ...res.locals.user }
      }
      if (!isUserDetailsPage) {
        if (recallsApiUserResponse.status === 'rejected') {
          if (recallsApiUserResponse.reason.status !== 404) {
            logger.error(recallsApiUserResponse.reason, `Error retrieving user details from manage-recalls-api`)
          }
          return res.redirect('/user-details')
        }
        if (recallsApiUserResponse.status === 'fulfilled') {
          res.locals.user = { ...res.locals.user, ...recallsApiUserResponse.value }
        }
      }
    }
    next()
  }
}
