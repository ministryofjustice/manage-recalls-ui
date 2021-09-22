import { Request, Response } from 'express'
import { addRecallDocument, getStoredDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentTypes } from './documentTypes'
import { UploadedFormFields } from '../../../@types'
import { makeFileData, listFailedUploads } from './helpers'
import { uploadStorageFields } from '../helpers/uploadStorage'
import { validateUploadDocuments } from './helpers/validateUploadDocuments'

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const { nomsNumber, recallId } = req.params
  uploadStorageFields(documentTypes)(req, res, async err => {
    try {
      if (err) {
        logger.error(err)
        return res.redirect(303, req.originalUrl)
      }
      const { files, session, body } = req
      const { user } = res.locals
      const fileData = makeFileData(files as UploadedFormFields)
      const { errors } = validateUploadDocuments({ fileData, requestBody: body })
      if (errors.length) {
        session.errors = errors
      }
      if (fileData.length) {
        const responses = await Promise.allSettled(
          fileData.map(({ originalFileName, label, ...file }) => addRecallDocument(recallId, file, user.token))
        )
        const failedUploads = listFailedUploads(fileData, responses)
        if (failedUploads.length) {
          session.errors = session.errors || []
          session.errors = [...failedUploads]
        }
      }
      if (session.errors && session.errors.length) {
        return res.redirect(303, req.originalUrl)
      }
      res.redirect(`/persons/${nomsNumber}/recalls/${recallId}/check-answers`)
    } catch (e) {
      logger.error(e)
      req.session.errors = [
        {
          name: 'saveError',
          text: 'An error occurred saving your changes',
        },
      ]
      res.redirect(303, req.originalUrl)
    }
  })
}

export const getUploadedDocument = async (req: Request, res: Response) => {
  const { recallId, documentId } = req.params
  const { user } = res.locals
  const response = await getStoredDocument(recallId, documentId, user.token)
  const documentType = documentTypes.find(type => type.name === response.category)
  if (documentType.type === 'document') {
    res.contentType('application/pdf')
    res.header('Content-Disposition', `inline; filename="${documentType.fileName}"`)
  }
  if (documentType.type === 'email') {
    res.contentType('application/octet-stream')
    res.header('Content-Disposition', `attachment; filename="${response.fileName}"`)
  }
  res.send(Buffer.from(response.content, 'base64'))
}
