import { NextFunction, Request, Response } from 'express'
import { getCurrentUserDetails, addUserDetails } from '../../clients/manageRecallsApiClient'
import logger from '../../../logger'
import { uploadStorageField } from '../documents/upload/helpers/uploadStorage'
import { FormError, ObjectMap } from '../../@types'
import { validateUserDetails } from './validators/validateUserDetails'
import { UserDetailsResponse } from '../../@types/manage-recalls-api/models/UserDetailsResponse'
import { isDefined } from '../../utils/utils'
import { saveErrorWithDetails } from '../utils/errorMessages'

const getFormValues = ({
  errors = {},
  unsavedValues = {},
  apiValues = {} as UserDetailsResponse,
}: {
  errors?: ObjectMap<FormError>
  apiValues: UserDetailsResponse
  unsavedValues: ObjectMap<string>
}) => {
  const values = {}
  ;['firstName', 'lastName', 'email', 'phoneNumber', 'caseworkerBand', 'signature'].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? errors[key].values || '' : unsavedValues[key] || apiValues[key]
  })
  return values
}

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let user: UserDetailsResponse
  const render = () => {
    res.locals.user = {
      ...res.locals.user,
      ...getFormValues({
        apiValues: user,
        unsavedValues: res.locals.unsavedValues,
        errors: res.locals.errors,
      }),
    }
    res.render(`pages/userDetails`)
  }
  try {
    const { token } = res.locals.user
    user = await getCurrentUserDetails(token)
    render()
  } catch (err) {
    if (err.status !== 404) {
      return next(err)
    }
    render()
  }
}

export const postUser = async (req: Request, res: Response): Promise<void> => {
  const { token } = res.locals.user
  const processUpload = uploadStorageField('signature')
  processUpload(req, res, async error => {
    try {
      if (error) {
        throw error
      }
      const { errors, valuesToSave, unsavedValues, confirmationMessage } = validateUserDetails(req.body, req.file)
      if (errors) {
        req.session.errors = errors
        req.session.unsavedValues = unsavedValues
      } else {
        await addUserDetails(valuesToSave, token)
        req.session.confirmationMessage = confirmationMessage
      }
    } catch (err) {
      logger.error(err)
      req.session.errors = [
        ...(req.session.errors || []),
        saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' }),
      ]
    } finally {
      res.redirect(303, req.originalUrl)
    }
  })
}
