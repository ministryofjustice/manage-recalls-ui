import { NextFunction, Request, Response } from 'express'
import { getPrisonerByNomsNumber, searchRecalls } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { validateFindPerson } from './validators/validateFindPerson'
import { makeErrorObject, transformErrorMessages } from '../utils/errorMessages'
import { isDefined } from '../../utils/utils'

export const findPerson = async (req: Request, res: Response, _next: NextFunction): Promise<Response | void> => {
  const { nomsNumber } = req.query
  let errors
  try {
    errors = validateFindPerson(nomsNumber as string)
    if (isDefined(nomsNumber) && !errors) {
      const trimmedNoms = (nomsNumber as string).trim()
      const [personResult, recallsResult] = await Promise.allSettled([
        getPrisonerByNomsNumber((trimmedNoms as string).trim(), res.locals.user.token),
        searchRecalls({ nomsNumber: trimmedNoms }, res.locals.user.token),
      ])

      let person
      if (personResult.status === 'rejected') {
        if (personResult.reason.status !== 404) {
          throw new Error(`getPerson failed`)
        }
      } else {
        person = personResult.value
      }
      res.locals.persons = []
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
