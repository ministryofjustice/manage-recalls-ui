import { FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isInvalidFileType } from '../../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload, makeErrorObject } from '../../utils/errorMessages'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'

export const validateNsyEmail = ({
  requestBody,
  file,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors

  const fileName = file?.originalname
  const invalidFileType = wasUploadFileReceived
    ? isInvalidFileType({ file, category: RecallDocument.category.RESCIND_DECISION_EMAIL })
    : false
  const { confirmNsyEmailSent } = requestBody
  const existingUpload = requestBody[UploadDocumentRequest.category.NSY_REMOVE_WARRANT_EMAIL] === 'existingUpload'
  if ((!wasUploadFileReceived && !existingUpload) || uploadFailed || invalidFileType || !confirmNsyEmailSent) {
    errors = []
    if (!confirmNsyEmailSent) {
      errors.push(
        makeErrorObject({
          id: 'confirmNsyEmailSent',
          text: errorMsgEmailUpload.confirmSent,
        })
      )
    }
    if (confirmNsyEmailSent && !wasUploadFileReceived && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (confirmNsyEmailSent && uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (confirmNsyEmailSent && !uploadFailed && invalidFileType) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat(fileName),
        })
      )
    }
  }
  const unsavedValues = {
    nsyEmailFileName: fileName,
    confirmNsyEmailSent,
  }
  return { errors, unsavedValues, redirectToPage: 'dossier-letter' }
}
