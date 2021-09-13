import { Request, Response } from 'express'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from './uploadStorage'

import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { ReqEmailUploadValidatorFn } from '../../../@types'

const allowedFileExtensions = ['.msg']

interface Args {
  emailFieldName: string
  validator: ReqEmailUploadValidatorFn
  documentCategory: ApiRecallDocument.category
  nextPageUrlSuffix: string
}

export const confirmEmailSent =
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
          allowedFileExtensions,
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
        res.redirect(303, `/persons/${nomsNumber}`)
      }
    })
  }