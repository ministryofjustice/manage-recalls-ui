import { Request, Response } from 'express'
import logger from '../../../../logger'
import { uploadStorageArray } from './helpers/uploadStorage'
import { deleteDocument } from '../delete/deleteDocument'
import { uploadMultipleNewDocuments } from './helpers/uploadMultipleNewDocuments'
import { categoriseFiles } from '../categorise/categoriseFiles'
import { errorMsgDocumentUpload, makeErrorObject } from '../../utils/errorMessages'

export const uploadDocumentsFormHandler = async (req: Request, res: Response) => {
  uploadStorageArray('documents')(req, res, async uploadError => {
    try {
      if (uploadError) {
        throw uploadError
      }
      // delete an uploaded file
      if (req.body.delete) {
        return await deleteDocument(req, res)
      }
      // new uploads
      if (req.body.upload === 'upload') {
        return await uploadMultipleNewDocuments(req, res)
      }
      // category changes
      if (req.body.continue === 'continue') {
        return await categoriseFiles(req, res)
      }
    } catch (e) {
      logger.error(e)
      req.session.errors = [
        makeErrorObject({
          id: 'documents',
          text: errorMsgDocumentUpload.saveError,
        }),
      ]
      res.redirect(303, req.originalUrl)
    }
  })
}
