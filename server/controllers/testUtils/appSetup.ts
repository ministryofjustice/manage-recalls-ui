import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import allRoutes from '../../routes'
import nunjucksSetup from '../../nunjucks/nunjucksSetup'
import errorHandler from '../../middleware/errorHandler'
import standardRouter from '../../routes/standardRouter'
import UserService from '../../clients/userService'
import * as auth from '../../authentication/auth'

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
  activeCaseLoadId: '1',
  uuid: '1223',
}

class MockUserService extends UserService {
  constructor() {
    super(undefined)
  }

  async getUser(token: string) {
    return {
      token,
      ...user,
    }
  }
}

function appSetup(route: Router, production: boolean): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.use((req, res, next) => {
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', route)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

export default function appWithAllRoutes({ production = false }: { production?: boolean }): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(allRoutes(standardRouter(new MockUserService())), production)
}
