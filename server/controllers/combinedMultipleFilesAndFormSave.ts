import { Request, Response } from 'express'
import { FormWithDocumentUploadValidatorFn, SaveToApiFn } from '../@types'
import { errorMsgDocumentUpload, makeErrorObject, saveErrorWithDetails } from './utils/errorMessages'
import { processUpload } from './documents/upload/helpers/processUpload'
import { RecallDocument } from '../@types/manage-recalls-api/models/RecallDocument'
import { FileError, MultiErrorResponse } from '../@types/manage-recalls-api'

const fieldNameFromDocCategory = (category: RecallDocument.category) => {
  switch (category) {
    case RecallDocument.category.PART_B_RISK_REPORT:
      return 'partBFileName'
    case RecallDocument.category.PART_B_EMAIL_FROM_PROBATION:
      return 'emailFileName'
    case RecallDocument.category.OASYS_RISK_ASSESSMENT:
      return 'oasysFileName'
    default:
      throw new Error(`fieldNameFromDocCategory: invalid category: ${category}`)
  }
}

export const parseVirusErrors = (errorData: MultiErrorResponse) => {
  if (!errorData || !errorData.fileErrors) {
    return undefined
  }
  return errorData.fileErrors
    .map((fileError: FileError) =>
      fileError?.error === 'VirusFoundException'
        ? makeErrorObject({
            id: fieldNameFromDocCategory(fileError.category),
            text: errorMsgDocumentUpload.containsVirus(fileError.fileName),
          })
        : undefined
    )
    .filter(Boolean)
}

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
      urlInfo,
    })
    let errorList = errors
    try {
      if (!errorList) {
        await saveToApiFn({ recallId, valuesToSave, user })
      }
    } catch (err) {
      const saveErrors = parseVirusErrors(err.data) || [
        saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' }),
      ]
      errorList = [...(errorList || []), ...saveErrors]
    }
    if (errorList) {
      req.session.errors = errorList
      req.session.unsavedValues = unsavedValues
      return res.redirect(303, req.originalUrl)
    }
    if (confirmationMessage) {
      req.session.confirmationMessage = confirmationMessage
    }
    return res.redirect(303, redirectToPage)
  }
