import { FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isInvalidEmailFileName } from '../../documents/upload/helpers/allowedUploadExtensions'
import { errorMsgEmailUpload, makeErrorObject } from '../../utils/errorMessages'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateNsyEmail = ({
  requestBody,
  fileName,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors

  const invalidFileName = isInvalidEmailFileName(fileName)
  const { confirmNsyEmailSent } = requestBody
  const existingUpload = requestBody[UploadDocumentRequest.category.NSY_REMOVE_WARRANT_EMAIL] === 'existingUpload'
  if ((!wasUploadFileReceived && !existingUpload) || uploadFailed || invalidFileName || !confirmNsyEmailSent) {
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
    if (confirmNsyEmailSent && !uploadFailed && invalidFileName) {
      errors.push(
        makeErrorObject({
          id: 'nsyEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
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
