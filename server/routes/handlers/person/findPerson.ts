import { NextFunction, Request, Response } from 'express'
import { searchRecalls } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { getPerson } from '../helpers/personCache'
import { isDefined, makeErrorObject, transformErrorMessages } from '../helpers'
import { validateFindPerson } from './helpers/validateFindPerson'

export const findPerson = async (req: Request, res: Response, _next: NextFunction): Promise<Response | void> => {
  const { nomsNumber } = req.query
  let errors
  try {
    errors = validateFindPerson(nomsNumber as string)
    if (isDefined(nomsNumber) && !errors) {
      const trimmedNoms = (nomsNumber as string).trim()
      const [personResult, recallsResult] = await Promise.allSettled([
        getPerson((trimmedNoms as string).trim(), res.locals.user.token),
        searchRecalls({ nomsNumber: trimmedNoms }, res.locals.user.token),
      ])
      if (personResult.status === 'rejected') {
        throw new Error(`getPerson failed`)
      }
      res.locals.persons = []
      const person = personResult.value
      if (person) {
        res.locals.persons = [person]
        res.locals.persons[0].recalls = recallsResult.status === 'fulfilled' ? recallsResult.value : []
      }
    }
    res.locals.isFindPersonPage = true
  } catch (err) {
    logger.error(err)
    errors = [
      makeErrorObject({
        id: 'nomsNumber',
        text: `An error occurred searching for the NOMIS number`,
      }),
    ]
  } finally {
    res.locals.errors = errors ? transformErrorMessages(errors) : undefined
    res.render('pages/findPerson')
  }
}
