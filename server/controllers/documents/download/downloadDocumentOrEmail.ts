import type { NextFunction, Request, Response } from 'express'
import contentDisposition from 'content-disposition'

import { getDocumentWithContents } from '../../../clients/manageRecallsApiClient'
import { documentCategories } from '../documentCategories'
import { getMimeTypeForFileName } from './helpers/getMimeTypeForFileName'

export const downloadDocumentOrEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      res.header('Content-Disposition', contentDisposition(formattedFileName))
    }
    if (documentCategory.type === 'email') {
      res.contentType('application/octet-stream')
      res.header('Content-Disposition', contentDisposition(fileName))
    }
    if (documentCategory.type === 'note_document') {
      const mimeType = getMimeTypeForFileName(fileName)
      res.contentType(mimeType)
      res.header('Content-Disposition', contentDisposition(fileName))
    }
    res.send(Buffer.from(content, 'base64'))
  } catch (err) {
    next(err)
  }
}
