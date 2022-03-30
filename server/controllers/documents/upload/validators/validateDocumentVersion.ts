import { isInvalidFileType } from '../helpers/allowedUploadExtensions'
import { UploadedFileMetadata } from '../../../../@types/documents'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { errorMsgDocumentUpload, errorMsgProvideDetail, makeErrorObject } from '../../../utils/errorMessages'
import { isFileSizeTooLarge } from '../helpers'
import { RecallDocument } from '../../../../@types/manage-recalls-api'

export const validateDocumentVersion = ({
  uploadedFileData,
  file,
  requestBody,
  uploadFailed,
}: {
  uploadedFileData: UploadedFileMetadata
  file?: Express.Multer.File
  requestBody: ObjectMap<string>
  uploadFailed: boolean
}): {
  errors?: NamedFormError[]
  valuesToSave: UploadedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: UploadedFileMetadata[]
  const invalidFileFormat =
    uploadedFileData &&
    isInvalidFileType({
      file,
      category: requestBody.categoryName as RecallDocument.category,
    })
  const fileSizeTooLarge = uploadedFileData && isFileSizeTooLarge(file.size)
  if (!uploadedFileData || uploadFailed || invalidFileFormat || fileSizeTooLarge || !requestBody.details) {
    errors = []
    if (!uploadedFileData) {
      errors = [
        makeErrorObject({
          id: 'document',
          text: errorMsgDocumentUpload.noFile,
        }),
      ]
    } else {
      const fileName = uploadedFileData.originalFileName
      if (invalidFileFormat) {
        errors.push(
          makeErrorObject({
            id: 'document',
            text: errorMsgDocumentUpload.invalidFileFormat(fileName),
          })
        )
      }
      if (fileSizeTooLarge) {
        errors.push(
          makeErrorObject({
            id: 'document',
            text: errorMsgDocumentUpload.invalidFileSize(fileName),
          })
        )
      }
    }
    if (!requestBody.details) {
      errors.push(
        makeErrorObject({
          id: 'details',
          text: errorMsgProvideDetail,
        })
      )
    }
  }
  if (!errors) {
    valuesToSave = valuesToSave || []
    valuesToSave.push(uploadedFileData)
  }
  return { errors, valuesToSave }
}
