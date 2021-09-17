import { NextFunction, Request, Response } from 'express'
import { searchRecalls, searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../logger'

export const findPerson = async (req: Request, res: Response, _next: NextFunction): Promise<Response | void> => {
  const { nomsNumber } = req.query
  try {
    if (typeof nomsNumber !== 'undefined' && typeof nomsNumber !== 'string') {
      res.locals.errorMessage = 'Please enter a valid NOMIS number'
    }
    if (nomsNumber) {
      const [personResult, recallsResult] = await Promise.allSettled([
        searchByNomsNumber((nomsNumber as string).trim(), res.locals.user.token),
        searchRecalls({ nomsNumber: nomsNumber as string }, res.locals.user.token),
      ])
      if (personResult.status === 'rejected') {
        throw new Error(`searchByNomsNumber failed for NOMS ${nomsNumber}`)
      }
      const person = personResult.value
      if (person) {
        person.recalls = recallsResult.status === 'fulfilled' ? recallsResult.value : []
      }
      res.locals.persons = person ? [person] : []
    }
    res.locals.isFindPersonPage = true
  } catch (err) {
    logger.error(err)
    res.locals.errors = [
      {
        name: 'saveError',
        text: `An error occurred searching for NOMIS "${nomsNumber}"`,
      },
    ]
  } finally {
    res.render('pages/findPerson')
  }
}
