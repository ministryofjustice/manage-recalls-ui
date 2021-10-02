import { Request, Response } from 'express'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from './uploadStorage'

import { AddDocumentRequest } from '../../../@types/manage-recalls-api/models/AddDocumentRequest'
import { ReqEmailUploadValidatorFn } from '../../../@types'
import { makeErrorObject } from './index'

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
    const saveError = [
      makeErrorObject({
        id: emailFieldName,
        text: 'The selected file could not be uploaded – try again',
      }),
    ]
    processUpload(req, res, async err => {
      try {
        const uploadFailed = Boolean(err)
        const { file } = req
        const emailFileSelected = Boolean(file)
        let saveToApiSuccessful = false

        const { errors, valuesToSave, unsavedValues } = validator({
          requestBody: req.body,
          fileName: file?.originalname,
          emailFileSelected,
          uploadFailed,
          actionedByUserId: res.locals.user.uuid,
        })
        if (!errors && emailFileSelected && !uploadFailed) {
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
            if (response.documentId) {
              saveToApiSuccessful = true
            }
          } catch (e) {
            saveToApiSuccessful = false
          }
        }
        if (errors || !saveToApiSuccessful) {
          req.session.errors = errors || saveError
          req.session.unsavedValues = unsavedValues
          return res.redirect(303, req.originalUrl)
        }
        await updateRecall(recallId, valuesToSave, res.locals.user.token)
        res.redirect(303, `/persons/${nomsNumber}/recalls/${recallId}/${nextPageUrlSuffix}`)
      } catch (e) {
        logger.error(e)
        req.session.errors = saveError
        res.redirect(303, req.originalUrl)
      }
    })
  }
