import { Request, Response } from 'express'
import { searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export const offenderProfile = async (req: Request, res: Response): Promise<Response> | undefined => {
  const { nomsNumber, recallId } = req.query
  if (nomsNumber && typeof nomsNumber !== 'string') {
    return res.send(400)
  }
  if (nomsNumber) {
    res.locals.offender = await searchByNomsNumber(nomsNumber as string, res.locals.user.token)
  }
  res.locals.nomsNumber = nomsNumber
  res.locals.recallId = recallId
  res.render('pages/offenderProfile')
}
