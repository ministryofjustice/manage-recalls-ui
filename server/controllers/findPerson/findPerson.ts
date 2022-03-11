import { NextFunction, Request, Response } from 'express'
import { getPrisonerByNomsNumber } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { validateFindPerson } from './validators/validateFindPerson'
import { makeErrorObject, transformErrorMessages } from '../utils/errorMessages'
import { isDefined } from '../../utils/utils'

export const findPerson = async (req: Request, res: Response, _next: NextFunction): Promise<Response | void> => {
  const { nomsNumber } = req.query
  let errors
  try {
    res.locals.nomsNumber = nomsNumber || ''
    errors = validateFindPerson(nomsNumber as string)
    if (isDefined(nomsNumber) && !errors) {
      const trimmedNoms = (nomsNumber as string).trim()
      res.locals.persons = []
      const person = await getPrisonerByNomsNumber((trimmedNoms as string).trim(), res.locals.user.token)
      if (person) {
        res.locals.persons = [person]
      }
    }
    res.locals.isFindPersonPage = true
  } catch (err) {
    if (err.status !== 404) {
      logger.error(err)
      errors = [
        makeErrorObject({
          id: 'nomsNumber',
          text: 'An error occurred searching for the NOMIS number',
        }),
      ]
    }
  } finally {
    res.locals.errors = errors ? transformErrorMessages(errors) : undefined
    res.render('pages/findPerson')
  }
}
