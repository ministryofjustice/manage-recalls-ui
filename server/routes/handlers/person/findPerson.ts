import { NextFunction, Request, Response } from 'express'
import { searchRecalls, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
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
        searchByNomsNumber((trimmedNoms as string).trim(), res.locals.user.token),
        searchRecalls({ nomsNumber: trimmedNoms }, res.locals.user.token),
      ])
      if (personResult.status === 'rejected') {
        throw new Error(`searchByNomsNumber failed`)
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
    errors = [
      makeErrorObject({
        id: 'nomsNumber',
        text: `An error occurred searching for the NOMIS number"`,
      }),
    ]
  } finally {
    res.locals.errors = errors ? transformErrorMessages(errors) : undefined
    res.render('pages/findPerson')
  }
}
