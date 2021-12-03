import { Router } from 'express'

import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import { populateCurrentUser } from '../middleware/populateCurrentUser'
import type UserService from '../services/userService'
import { requestLogging } from '../middleware/requestLogging'

export default function standardRouter(userService: UserService): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.get('*', populateCurrentUser(userService))
  router.use(requestLogging)
  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
