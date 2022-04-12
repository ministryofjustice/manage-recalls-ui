import express, { Response, Router } from 'express'
import helmet from 'helmet'
import { randomBytes } from 'crypto'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  router.use((req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('hex')
    next()
  })
  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: [
            "'self'",
            'code.jquery.com',
            'www.googletagmanager.com',
            'cdn.lr-in.com',
            'cdn.logrocket.io',
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
            (req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
          ],
          connectSrc: ["'self'", 'www.google-analytics.com', 'https://*.lr-in.com', 'https://r.logrocket.io'],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'www.google-analytics.com'],
          childSrc: ["'self'", 'blob:'],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    })
  )

  return router
}
