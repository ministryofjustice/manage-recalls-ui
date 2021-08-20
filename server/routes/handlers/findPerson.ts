import { NextFunction, Request, Response } from 'express'
import { searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export const findPerson = async (req: Request, res: Response, _next: NextFunction): Promise<Response | void> => {
  const { nomsNumber } = req.query
  if (typeof nomsNumber !== 'undefined' && typeof nomsNumber !== 'string') {
    res.locals.errorMessage = 'Please enter a valid NOMS number'
  }
  if (nomsNumber) {
    const offender = await searchByNomsNumber((nomsNumber as string).trim(), res.locals.user.token)
    res.locals.offenders = offender ? [offender] : []
  }
  res.locals.isFindPersonPage = true
  res.render('pages/findPerson')
}
