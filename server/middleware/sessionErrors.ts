import { NextFunction, Request, Response } from 'express'
import { ObjectMap } from '../@types/express'
import { FormError, NamedFormError } from '../@types'

export const sessionErrors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { errors } = req.session
  if (errors) {
    const errorMap = errors.reduce((acc: ObjectMap<FormError>, curr: NamedFormError) => {
      const { name, ...rest } = curr
      acc[name] = rest
      return acc
    }, {})
    res.locals.errors = {
      list: errors,
      ...errorMap,
    }
    delete req.session.errors
  }
  next()
}
