// recall notification
// dossier
// letter to prison
import { NextFunction, Request, Response } from 'express'
import { isInvalid } from '../../helpers'
import { generateRecallDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { GenerateDocumentRequest } from '../../../../@types/manage-recalls-api/models/GenerateDocumentRequest'

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
  const { documentId } = await generateRecallDocument(
    recallId,
    { category: category as GenerateDocumentRequest.category, details: '' },
    token
  )
  res.locals.documentId = documentId
  next()
}
