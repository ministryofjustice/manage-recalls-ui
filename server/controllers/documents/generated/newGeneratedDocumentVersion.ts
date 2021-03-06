import { NextFunction, Request, Response } from 'express'
import { validateGeneratedDocumentVersion } from './validators/validateGeneratedDocumentVersion'
import { generateRecallDocument } from '../../../clients/manageRecallsApiClient'
import logger from '../../../../logger'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { revocationOrderCreated } from './helpers/revocationOrderCreated'
import { makeUrlToFromPage } from '../../utils/makeUrl'
import { generatedDocCategoriesList } from './helpers'
import { saveErrorWithDetails } from '../../utils/errorMessages'

export const newGeneratedDocumentVersion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { recallId } = req.params
    const { body } = req
    const { category, dossierExists } = body
    const {
      user: { token },
      urlInfo,
    } = res.locals
    const invalidCategory = !generatedDocCategoriesList().find(cat => cat.name === category)
    const reload = () => {
      const redirectUrl = req.session.errors
        ? `${req.originalUrl}&versionedCategoryName=${category}`
        : `${urlInfo.basePath}${urlInfo.fromPage}`
      res.redirect(303, redirectUrl)
    }

    if (invalidCategory) {
      throw new Error('Invalid category')
    }
    const { errors, unsavedValues, valuesToSave } = await validateGeneratedDocumentVersion({
      requestBody: body,
      recallId,
      token,
    })
    if (errors) {
      req.session.errors = errors
      req.session.unsavedValues = unsavedValues
      return reload()
    }
    try {
      await generateRecallDocument(recallId, valuesToSave, token)
      // if it's a revocation order, then create a new recall notification (and dossier, if it already exists) as well
      if (category === RecallDocument.category.REVOCATION_ORDER) {
        await revocationOrderCreated({ recallId, valuesToSave, dossierExists, req, token })
      }
      res.redirect(303, makeUrlToFromPage(urlInfo.fromPage, urlInfo))
    } catch (err) {
      logger.error(err)
      req.session.errors = [
        ...(req.session.errors || []),
        saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' }),
      ]
      return reload()
    }
  } catch (err) {
    next(err)
  }
}
