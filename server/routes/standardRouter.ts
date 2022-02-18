import { Router } from 'express'
import cookieParser from 'cookie-parser'

import auth from '../authentication/auth'
import tokenVerifier from '../clients/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'
import type UserService from '../clients/userService'
import { requestLogging } from '../middleware/requestLogging'

export default function standardRouter(userService: UserService): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(userService))
  router.use(requestLogging)
  router.use(cookieParser())
  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
