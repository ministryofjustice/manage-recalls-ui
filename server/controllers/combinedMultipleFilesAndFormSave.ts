import { Request, Response } from 'express'
import { FormWithDocumentUploadValidatorFn, SaveToApiFn } from '../@types'
import { errorMsgDocumentUpload, makeErrorObject, saveErrorWithDetails } from './utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from './utils/makeUrl'
import { processUpload } from './documents/upload/helpers/processUpload'

export const combinedMultipleFilesAndFormSave =
  ({
    uploadFormFieldNames,
    validator,
    saveToApiFn,
  }: {
    uploadFormFieldNames: string[]
    validator: FormWithDocumentUploadValidatorFn
    saveToApiFn?: SaveToApiFn
  }) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const { user, urlInfo } = res.locals
    const { request, uploadFailed } = await processUpload(uploadFormFieldNames, req, res)
    const { files } = request
    const { errors, valuesToSave, unsavedValues, redirectToPage, confirmationMessage } = validator({
      requestBody: request.body,
      filesUploaded: files,
      uploadFailed,
    })
    let errorList = errors
    try {
      if (!errorList) {
        await saveToApiFn({ recallId, valuesToSave, user })
      }
    } catch (err) {
      const saveError =
        err.data?.message === 'VirusFoundException'
          ? makeErrorObject({
              id: 'test', // uploadFormFieldName,
              text: errorMsgDocumentUpload.containsVirus('FILENAME'),
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
  }
