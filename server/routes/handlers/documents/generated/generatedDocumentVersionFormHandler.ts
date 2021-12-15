import { Request, Response } from 'express'
import { validateGeneratedDocumentVersion } from './validations/validateGeneratedDocumentVersion'
import { generateRecallDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../../logger'
import { generatedDocCategoriesList } from '../download/helpers'

export const generatedDocumentVersionFormHandler = async (req: Request, res: Response) => {
  const reload = () => {
    const redirectUrl = req.session.errors
      ? `${req.originalUrl}&versionedCategoryName=${req.body.category}`
      : `${res.locals.urlInfo.basePath}${res.locals.urlInfo.fromPage}`
    res.redirect(303, redirectUrl)
  }

  const { recallId } = req.params
  const { body } = req
  const {
    user: { token },
    urlInfo,
  } = res.locals
  const invalidCategory = !generatedDocCategoriesList().find(cat => cat.name === body.category)
  if (invalidCategory) {
    throw new Error('Invalid category')
  }
  const { errors, unsavedValues, valuesToSave } = validateGeneratedDocumentVersion(body)
  if (errors) {
    req.session.errors = errors
    req.session.unsavedValues = unsavedValues
    return reload()
  }
  try {
    await generateRecallDocument(recallId, valuesToSave, token)
    res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage}`)
  } catch (err) {
    logger.error(err)
    req.session.errors = [
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ]
    return reload()
  }
}
