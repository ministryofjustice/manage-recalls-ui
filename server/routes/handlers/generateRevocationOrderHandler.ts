import type { RequestHandler } from 'express'
import { generateRevocationOrder } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export default function generateRevocationOrderHandler(): RequestHandler {
  return async (req, res, next) => {
    const revocationDocument = await generateRevocationOrder(res.locals.user.token)
  }
}
