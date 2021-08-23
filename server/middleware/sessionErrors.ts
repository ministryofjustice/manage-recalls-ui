import { NextFunction, Request, Response } from 'express'
import { FormError, NamedFormError, ObjectMap } from '../@types'

export const sessionErrors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { errors, unsavedValues } = req.session
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
    res.locals.unsavedValues = unsavedValues
    delete req.session.errors
    delete req.session.unsavedValues
  }
  next()
}
