import { Request, Response } from 'express'
import { listMissingRequiredDocs } from '../upload/helpers'
import { getRecall } from '../../../../clients/manageRecallsApiClient'
import { makeUrl } from '../../../../utils/nunjucksFunctions'
import { getMetadataForCategorisedFiles, saveCategories } from './helpers'
import { validateCategories } from './validations/validateCategories'

export const categoriseFiles = async (req: Request, res: Response) => {
  const { session, body } = req
  const { recallId } = req.params
  const {
    user: { token },
    urlInfo,
  } = res.locals
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
  if (listMissingRequiredDocs({ docs: recall.documents, returnLabels: true }).length) {
    // if the user came from a recall info page, add querystring so they'll be redirected back there after missing documents page
    return res.redirect(303, makeUrl('missing-documents', urlInfo))
  }
  res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage || 'check-answers'}`)
}
