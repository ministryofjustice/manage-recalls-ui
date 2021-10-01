import { Request, Response } from 'express'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { allowedEmailFileExtensions, uploadStorageField } from './uploadStorage'

import { AddDocumentRequest } from '../../../@types/manage-recalls-api/models/AddDocumentRequest'
import { ReqEmailUploadValidatorFn } from '../../../@types'

interface Args {
  emailFieldName: string
  validator: ReqEmailUploadValidatorFn
  documentCategory: AddDocumentRequest.category
  nextPageUrlSuffix: string
}

export const emailUploadForm =
  ({ emailFieldName, validator, documentCategory, nextPageUrlSuffix }: Args) =>
  async (req: Request, res: Response): Promise<void> => {
    const processUpload = uploadStorageField(emailFieldName)
    const { nomsNumber, recallId } = req.params
    const { user } = res.locals
    if (!nomsNumber || !recallId) {
      logger.error(`nomsNumber or recallId not supplied. URL: ${req.originalUrl}`)
      res.sendStatus(400)
      return
    }
    processUpload(req, res, async err => {
      try {
        let uploadFailed = Boolean(err)
        const { file } = req
        const emailFileSelected = Boolean(file)
        if (emailFileSelected && !uploadFailed) {
          try {
            const response = await addRecallDocument(
              recallId,
              {
                fileName: file.originalname,
                fileContent: file.buffer.toString('base64'),
                category: documentCategory,
              },
              user.token
            )
            if (!response.documentId) {
              uploadFailed = true
            }
          } catch (e) {
            uploadFailed = true
          }
        }
        const { errors, valuesToSave, unsavedValues } = validator({
          requestBody: req.body,
          fileName: file?.originalname,
          emailFileSelected,
          uploadFailed,
          allowedFileExtensions: allowedEmailFileExtensions,
          actionedByUserId: res.locals.user.uuid,
        })
        if (errors) {
          req.session.errors = errors
          req.session.unsavedValues = unsavedValues
          return res.redirect(303, req.originalUrl)
        }
        const recall = await updateRecall(recallId, valuesToSave, res.locals.user.token)
        res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/${nextPageUrlSuffix}`)
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
