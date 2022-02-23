// recall notification
// dossier
// letter to prison
import { NextFunction, Request, Response } from 'express'
import { generateRecallDocument, getDocumentCategoryHistory } from '../../../clients/manageRecallsApiClient'
import { RecallDocument } from '../../../@types/manage-recalls-api'
import { sortList } from '../../utils/lists'
import { isInvalid } from '../../../utils/utils'
import { getGeneratedDocumentFileName } from './helpers'

// for the initial creation only of recall notification / letter / dossier, not for creating further versions
export const createGeneratedDocument = async (req: Request, res: Response, next: NextFunction) => {
  const { nomsNumber, recallId } = req.params
  const { category } = req.query
  const { token } = res.locals.user
  if (
    isInvalid(nomsNumber) ||
    isInvalid(recallId) ||
    !['DOSSIER', 'LETTER_TO_PRISON', 'RECALL_NOTIFICATION'].includes(category as string)
  ) {
    return res.sendStatus(400)
  }
  const cat = category as RecallDocument.category
  const existingDocs = await getDocumentCategoryHistory(recallId, cat, token)
  if (existingDocs.length > 0) {
    const sorted = sortList(existingDocs, 'version', false)
    res.locals.documentId = sorted[0].documentId
  } else {
    const fileName = await getGeneratedDocumentFileName({ category: cat, recallId, token })
    const { documentId } = await generateRecallDocument(recallId, { category: cat, fileName }, token)
    res.locals.documentId = documentId
  }
  next()
}
