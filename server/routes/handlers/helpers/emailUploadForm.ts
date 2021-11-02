import { Request, Response } from 'express'
import { addRecallDocument, updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { uploadStorageField } from './uploadStorage'

import { AddDocumentRequest } from '../../../@types/manage-recalls-api/models/AddDocumentRequest'
import { ReqEmailUploadValidatorFn } from '../../../@types'
import { makeErrorObject } from './index'
import { allowedEmailFileExtensions } from './allowedUploadExtensions'
import { RecallResponse } from '../../../@types/manage-recalls-api'

interface Args {
  emailFieldName: string
  validator: ReqEmailUploadValidatorFn
  documentCategory: AddDocumentRequest.category
  nextPageUrlSuffix: string
  unassignUserFromRecall?: (recallId: string, userId: string, token: string) => Promise<RecallResponse>
}

export const emailUploadForm =
  ({ emailFieldName, validator, documentCategory, nextPageUrlSuffix, unassignUserFromRecall }: Args) =>
  async (req: Request, res: Response): Promise<void> => {
    const processUpload = uploadStorageField(emailFieldName)
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    let saveError = [
      makeErrorObject({
        id: emailFieldName,
        text: 'The selected file could not be uploaded – try again',
      }),
    ]
    let saveToApiSuccessful = false
    processUpload(req, res, async err => {
      try {
        const uploadFailed = Boolean(err)
        const { file } = req
        const emailFileSelected = Boolean(file)
        const invalidFileFormat = emailFileSelected
          ? !allowedEmailFileExtensions.some(ext => file.originalname.endsWith(ext.extension))
          : false
        const { errors, valuesToSave, unsavedValues } = validator({
          requestBody: req.body,
          fileName: file?.originalname,
          emailFileSelected,
          uploadFailed,
          invalidFileFormat,
          actionedByUserId: user.uuid,
        })
        const uploadHasErrors = errors && errors.find(uploadError => uploadError.name === emailFieldName)
        const shouldSaveToApi = !uploadHasErrors && emailFileSelected && !uploadFailed
        if (shouldSaveToApi) {
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
            if (e.data?.message === 'VirusFoundException') {
              saveError = [
                makeErrorObject({
                  id: emailFieldName,
                  text: `${file.originalname} contains a virus`,
                }),
              ]
            }
          }
        }
        if (errors || (shouldSaveToApi && !saveToApiSuccessful)) {
          req.session.errors = errors || saveError
          req.session.unsavedValues = unsavedValues
          return res.redirect(303, req.originalUrl)
        }
        await updateRecall(recallId, valuesToSave, user.token)
        if (unassignUserFromRecall) {
          try {
            await unassignUserFromRecall(recallId, user.uuid, user.token)
          } catch (e) {
            logger.error(`User ${user.uuid} could not be unassigned from recall ${recallId}`)
          }
        }
        return res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage || nextPageUrlSuffix}`)
      } catch (e) {
        logger.error(e)
        req.session.errors = !saveToApiSuccessful
          ? saveError
          : [
              {
                name: 'saveError',
                text: 'An error occurred saving the completed assessment',
              },
            ]
        res.redirect(303, req.originalUrl)
      }
    })
  }
