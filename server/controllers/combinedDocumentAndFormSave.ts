import { NextFunction, Request, Response } from 'express'
import { FormWithDocumentUploadValidatorFn, SaveToApiFn } from '../@types'
import { errorMsgDocumentUpload, makeErrorObject, saveErrorWithDetails } from './utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from './utils/makeUrl'
import { processUpload } from './documents/upload/helpers/processUpload'
import { sendFileSizeMetric } from './documents/upload/helpers/sendFileSizeMetric'

export const combinedDocumentAndFormSave =
  ({
    uploadFormFieldName,
    validator,
    saveToApiFn,
  }: {
    uploadFormFieldName: string
    validator: FormWithDocumentUploadValidatorFn
    saveToApiFn?: SaveToApiFn
  }) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { recallId } = req.params
      const { user, urlInfo } = res.locals
      const { request, uploadFailed } = await processUpload(uploadFormFieldName, req, res)
      const { file } = request
      sendFileSizeMetric(file)
      const wasUploadFileReceived = Boolean(file)
      const { errors, valuesToSave, unsavedValues, redirectToPage, confirmationMessage } = validator({
        requestBody: request.body,
        file,
        wasUploadFileReceived,
        uploadFailed,
        actionedByUserId: user.uuid,
      })
      let errorList = errors
      try {
        if (!errorList) {
          const fileData = wasUploadFileReceived
            ? {
                fileName: file.originalname,
                fileContent: file.buffer.toString('base64'),
              }
            : {}
          await saveToApiFn({ recallId, valuesToSave: { ...valuesToSave, ...fileData }, user })
        }
      } catch (err) {
        const saveError =
          err.data?.message === 'VirusFoundException'
            ? makeErrorObject({
                id: uploadFormFieldName,
                text: errorMsgDocumentUpload.containsVirus(file.originalname),
              })
            : saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })
        errorList = [...(errorList || []), saveError]
      }
      if (errorList) {
        req.session.errors = errorList
        req.session.unsavedValues = unsavedValues
        return res.redirect(303, req.originalUrl)
      }
      if (confirmationMessage) {
        req.session.confirmationMessage = confirmationMessage
      }
      return res.redirect(
        303,
        urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl(redirectToPage, urlInfo)
      )
    } catch (err) {
      next(err)
    }
  }
