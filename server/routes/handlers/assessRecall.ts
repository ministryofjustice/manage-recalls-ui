import { Request, Response } from 'express'
import { searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

export const assessRecall = async (req: Request, res: Response): Promise<Response> | undefined => {
  const { nomsNumber } = req.query
  if (nomsNumber && typeof nomsNumber !== 'string') {
    return res.send(400)
  }
  if (nomsNumber) {
    res.locals.offender = await searchByNomsNumber(nomsNumber as string, res.locals.user.token)
  }
  res.locals.nomsNumber = nomsNumber
  res.locals.isTodoPage = true
  res.render('pages/assessRecall')
}
