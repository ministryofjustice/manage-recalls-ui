import express, { Response } from 'express'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

import { randomBytes } from 'crypto'
import addRequestId from 'express-request-id'
import compression from 'compression'
import connectRedis from 'connect-redis'
import createError from 'http-errors'
import csurf from 'csurf'
import flash from 'connect-flash'
import helmet from 'helmet'
import noCache from 'nocache'
import passport from 'passport'
import path from 'path'
import rateLimit from 'express-rate-limit'
import session from 'express-session'

import auth from './authentication/auth'
import indexRoutes from './routes'
import healthcheck from './healthChecks/healthCheck'
import nunjucksSetup from './nunjucks/nunjucksSetup'
import config from './config'
import errorHandler from './middleware/errorHandler'
import standardRouter from './routes/standardRouter'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import type UserService from './clients/userService'
import { getStoredSessionData } from './middleware/getStoredSessionData'
import { getRedisClient } from './clients/redis'
import { appInsightsOperationId } from './middleware/appInsightsOperationId'
import { metricsMiddleware } from './monitoring/metricsApp'

const version = Date.now().toString()
const production = process.env.NODE_ENV === 'production'
const testMode = process.env.NODE_ENV === 'test'
const RedisStore = connectRedis(session)

export default function createApp(userService: UserService): express.Application {
  const app = express()

  // Setup prometheus metrics
  app.use(metricsMiddleware)

  Sentry.init({
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    ignoreErrors: ['AbortError', /^Invalid URL$/, /^Redis connection to/],
    // Quarter of all requests will be used for performance sampling
    tracesSampler: samplingContext => {
      const transactionName =
        samplingContext && samplingContext.transactionContext && samplingContext.transactionContext.name

      if (transactionName && (transactionName.includes('ping') || transactionName.includes('health'))) {
        return 0
      }

      // Default sample rate
      return 0.05
    },
  })

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(
    Sentry.Handlers.requestHandler({
      // Ensure we don't include `data` to avoid sending any PPI
      request: ['cookies', 'headers', 'method', 'query_string', 'url'],
      user: ['id', 'username', 'permissions'],
    })
  )

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler())

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

  app.use((req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('hex')
    next()
  })
  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: [
            "'self'",
            'code.jquery.com',
            'www.googletagmanager.com',
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
            (req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
          ],
          connectSrc: ["'self'", 'www.google-analytics.com'],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'www.google-analytics.com'],
        },
      },
    })
  )

  app.use(addRequestId())

  app.use(
    session({
      store: new RedisStore({ client: getRedisClient() }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())

  // Request Processing Configuration
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use(flash())

  // Resource Delivery Configuration
  app.use(compression())

  app.use(getStoredSessionData)

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

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }
  ;[
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    '/node_modules/govuk-frontend/govuk/assets',
    '/node_modules/govuk-frontend',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
    '/node_modules/web-vitals/dist',
  ].forEach(dir => {
    app.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/govuk_frontend_toolkit/images'].forEach(dir => {
    app.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/jquery/dist/jquery.min.js'].forEach(dir => {
    app.use('/assets/js/jquery.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  // Express Routing Configuration
  app.get('/health', (req, res, next) => {
    healthcheck(result => {
      if (!result.healthy) {
        res.status(503)
      }
      res.json(result)
    })
  })
  app.get('/ping', (req, res) =>
    res.send({
      status: 'UP',
    })
  )

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

  // Don't cache dynamic resources
  app.use(noCache())

  // CSRF protection
  if (!testMode) {
    app.use(csurf())
  }

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  // Security recommendation - add rate limiting to prevent DOS attacks
  // ref: https://github.com/ministryofjustice/manage-recalls-ui/security/code-scanning/21?query=ref%3Arefs%2Fpull%2F638%2Fmerge

  const RateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 5 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })

  app.use(RateLimiter)

  app.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  app.get('/login', passport.authenticate('oauth2'))

  app.get('/login/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next)
  )

  const authLogoutUrl = `${config.apis.hmppsAuth.externalUrl}/logout?client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${config.domain}`

  app.use('/logout', (req, res) => {
    if (req.user) {
      req.logout()
      req.session.destroy(() => res.redirect(authLogoutUrl))
      return
    }
    res.redirect(authLogoutUrl)
  })

  app.use(authorisationMiddleware())
  app.use('/', indexRoutes(standardRouter(userService)))

  app.use((req, res, next) => next(createError(404, 'Not found')))

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
