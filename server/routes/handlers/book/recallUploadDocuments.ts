import { Request, Response } from 'express'
import { addRecallDocument, getStoredDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentTypes } from './documentTypes'
import { UploadedFormFields } from '../../../@types'
import { makeMetaDataForFiles, listFailedUploads } from './helpers'
import { uploadStorageFields } from '../helpers/uploadStorage'
import { validateUploadDocuments } from './helpers/validateUploadDocuments'

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const { recallId } = req.params
  uploadStorageFields(documentTypes)(req, res, async uploadError => {
    try {
      if (uploadError) {
        throw uploadError
      }
      const { files, session, body } = req
      const { user, urlInfo } = res.locals
      const fileData = makeMetaDataForFiles(files as UploadedFormFields)
      const { errors } = validateUploadDocuments({ fileData, requestBody: body })
      if (errors) {
        session.errors = errors
      }
      if (fileData.length) {
        const responses = await Promise.allSettled(
          fileData.map(file => {
            if (errors && errors.find(e => e.name === file.category)) {
              return undefined
            }
            const { category, fileContent, originalFileName } = file
            return addRecallDocument(recallId, { category, fileContent, fileName: originalFileName }, user.token)
          })
        )
        const failedUploads = listFailedUploads(fileData, responses.filter(Boolean))
        if (failedUploads.length) {
          session.errors = session.errors || []
          session.errors = [...failedUploads]
        }
      }
      if (session.errors && session.errors.length) {
        return res.redirect(303, req.originalUrl)
      }
      res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage || 'check-answers'}`)
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
