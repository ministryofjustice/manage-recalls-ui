import type { Request, Response } from 'express'
import { getDocumentWithContents } from '../../../clients/manageRecallsApiClient'
import { documentCategories } from '../documentCategories'

export const downloadDocumentOrEmail = async (req: Request, res: Response) => {
  const { recallId } = req.params
  const documentId = res.locals.documentId || req.params.documentId
  const {
    user: { token },
  } = res.locals
  const { category, fileName, content } = await getDocumentWithContents({ recallId, documentId }, token)
  const documentCategory = documentCategories.find(type => type.name === category)
  if (['generated', 'document'].includes(documentCategory.type)) {
    const formattedFileName = documentCategory.standardFileName || fileName
    res.contentType('application/pdf')
    res.header('Content-Disposition', `attachment; filename="${formattedFileName}"`)
  }
  if (documentCategory.type === 'email') {
    res.contentType('application/octet-stream')
    res.header('Content-Disposition', `attachment; filename="${fileName}"`)
  }
  res.send(Buffer.from(content, 'base64'))
}
