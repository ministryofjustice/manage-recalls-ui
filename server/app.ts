import express from 'express'
import * as Sentry from '@sentry/node'
import addRequestId from 'express-request-id'
import createError from 'http-errors'
import csurf from 'csurf'
import flash from 'connect-flash'
import passport from 'passport'
import path from 'path'
import auth from './authentication/auth'
import indexRoutes from './routes'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpSentry from './middleware/setUpSentry'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpStaticResources from './middleware/setUpStaticResources'
import nunjucksSetup from './nunjucks/nunjucksSetup'
import config from './config'
import errorHandler from './middleware/errorHandler'
import standardRouter from './routes/standardRouter'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import type UserService from './clients/userService'
import { appInsightsOperationId } from './middleware/appInsightsOperationId'
import { metricsMiddleware } from './monitoring/metricsApp'
import setUpWebSession from './middleware/setUpWebSession'
import setUpAuth from './middleware/setUpAuth'

const version = Date.now().toString()
const production = process.env.NODE_ENV === 'production'
const testMode = process.env.NODE_ENV === 'test'

export default function createApp(userService: UserService): express.Application {
  const app = express()

  // Setup prometheus metrics
  app.use(metricsMiddleware)

  app.use(setUpSentry())
  app.use(appInsightsOperationId)

  auth.init()

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  // Server Configuration
  app.set('port', process.env.PORT || 3000)

  app.use(setUpWebSecurity())

  app.use(addRequestId())
  app.use(setUpWebSession())

  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  // Request Processing Configuration
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = version
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }
  app.use(setUpStaticResources())
  app.use(setUpHealthChecks())

  // GovUK Template Configuration
  app.locals.asset_path = '/assets/'
  app.locals.applicationName = config.applicationName

  app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.env = process.env.ENVIRONMENT // DEVELOPMENT/ PRE-PRODUCTION / PRODUCTION
    if (res.locals.env === 'PRODUCTION') {
      res.locals.googleAnalyticsId = 'UA-106741063-23'
    }
    if (res.locals.env === 'PRE-PRODUCTION') {
      res.locals.googleAnalyticsId = 'UA-106741063-22'
    }
    next()
  })

  // CSRF protection
  if (!testMode) {
    app.use(csurf())
  }
  app.use(setUpAuth())
  app.use(authorisationMiddleware())
  app.use('/', indexRoutes(standardRouter(userService)))

  app.use((req, res, next) => next(createError(404, 'Not found')))

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
