// add new version page
import { Request, Response } from 'express'
import { uploadStorageField } from './helpers/uploadStorage'
import { makeMetaDataForFile, uploadedDocCategoriesList } from './helpers'
import { validateDocumentVersion } from './validators/validateDocumentVersion'
import logger from '../../../../logger'
import { errorMsgDocumentUpload, makeErrorObject } from '../../utils/errorMessages'
import { uploadRecallDocument } from '../../../clients/manageRecallsApiClient'
import { makeUrlToFromPage } from '../../utils/makeUrl'
import { sendFileSizeMetric } from './helpers/sendFileSizeMetric'

export const uploadDocumentVersionFormHandler = async (req: Request, res: Response) => {
  uploadStorageField('document')(req, res, async uploadError => {
    const {
      user: { token },
      urlInfo,
    } = res.locals
    try {
      const uploadFailed = Boolean(uploadError)
      const { recallId } = req.params
      const { file, session, body } = req
      sendFileSizeMetric(file)
      const invalidCategory = !uploadedDocCategoriesList().find(cat => cat.name === body.categoryName)
      if (invalidCategory) {
        throw new Error('Invalid category')
      }
      const uploadedFileData = file && makeMetaDataForFile(file, body.categoryName, body.details)
      const { errors } = validateDocumentVersion({
        uploadedFileData,
        file,
        requestBody: body,
        uploadFailed,
      })
      session.errors = errors
      if (!session.errors) {
        const { category, fileContent, originalFileName, details } = uploadedFileData
        try {
          await uploadRecallDocument(recallId, { category, fileContent, fileName: originalFileName, details }, token)
        } catch (err) {
          if (err.data?.message === 'VirusFoundException') {
            session.errors = [
              makeErrorObject({
                id: 'document',
                text: errorMsgDocumentUpload.containsVirus(originalFileName),
              }),
            ]
          } else {
            session.errors = [
              makeErrorObject({
                id: 'document',
                text: errorMsgDocumentUpload.uploadFailed(originalFileName),
              }),
            ]
          }
        }
      }
    } catch (e) {
      logger.error(e)
      req.session.errors = req.session.errors || [
        makeErrorObject({
          id: 'document',
          text: errorMsgDocumentUpload.saveError,
        }),
      ]
    } finally {
      const redirectUrl = req.session.errors
        ? `${req.originalUrl}&versionedCategoryName=${req.body.categoryName}`
        : makeUrlToFromPage(urlInfo.fromPage, urlInfo)

      res.redirect(303, redirectUrl)
    }
  })
}
