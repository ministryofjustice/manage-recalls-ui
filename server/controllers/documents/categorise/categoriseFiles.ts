import { Request, Response } from 'express'
import { getRecall } from '../../../clients/manageRecallsApiClient'
import { getMetadataForCategorisedFiles, saveCategories } from './helpers'
import { validateCategories } from './validators/validateCategories'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'
import logger from '../../../../logger'
import { saveErrorWithDetails } from '../../utils/errorMessages'

export const categoriseFiles = async (req: Request, res: Response) => {
  const { session, body } = req
  const { recallId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals
  try {
    const categorisedFileData = getMetadataForCategorisedFiles(body)
    const { errors: uncategorisedFileErrors, valuesToSave: categorisedToSave } = validateCategories(categorisedFileData)
    if (uncategorisedFileErrors?.length) {
      session.errors = [...(session.errors || []), ...uncategorisedFileErrors]
    }
    const failedSaves = await saveCategories({ recallId, categorisedToSave, token })
    if (failedSaves.length) {
      session.errors = [...(session.errors || []), ...failedSaves]
    }
    if (session.errors && session.errors.length) {
      return res.redirect(303, req.originalUrl)
    }
    const recall = await getRecall(recallId, token)
    if (recall.missingDocuments) {
      // if the user came from a recall info page, add querystring so they'll be redirected back there after missing documents page
      return res.redirect(303, makeUrl('missing-documents', urlInfo))
    }
    if (urlInfo.fromPage) {
      return res.redirect(303, makeUrlToFromPage(urlInfo.fromPage, urlInfo))
    }
    res.redirect(303, makeUrlToFromPage('check-answers', urlInfo))
  } catch (err) {
    logger.error(err)
    req.session.errors = [
      ...(session.errors || []),
      saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' }),
    ]
    res.redirect(303, req.originalUrl)
  }
}
