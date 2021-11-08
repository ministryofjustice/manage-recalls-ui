import { Request, Response } from 'express'
import { getStoredDocument } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentCategories } from './documentCategories'

export const downloadUploadedDocumentOrEmail = async (req: Request, res: Response) => {
  const { recallId, documentId } = req.params
  const { user } = res.locals
  const response = await getStoredDocument(recallId, documentId, user.token)
  const documentCategory = documentCategories.find(type => type.name === response.category)
  if (documentCategory.type === 'document') {
    res.contentType('application/pdf')
    res.header('Content-Disposition', `inline; filename="${documentCategory.fileName || response.fileName}"`)
  }
  if (documentCategory.type === 'email') {
    res.contentType('application/octet-stream')
    res.header('Content-Disposition', `attachment; filename="${response.fileName}"`)
  }
  res.send(Buffer.from(response.content, 'base64'))
}
