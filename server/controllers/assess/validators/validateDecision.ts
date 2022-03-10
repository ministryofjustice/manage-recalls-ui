import { FormWithDocumentUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { errorMsgEmailUpload, errorMsgProvideDetail, makeErrorObject } from '../../utils/errorMessages'
import { ConfirmedRecallTypeRequest } from '../../../@types/manage-recalls-api/models/ConfirmedRecallTypeRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'
import { isInvalidEmailFileName } from '../../documents/upload/helpers/allowedUploadExtensions'

export const validateDecision = ({
  fileName,
  requestBody,
  wasUploadFileReceived,
  uploadFailed,
}: FormWithDocumentUploadValidatorArgs): ReqValidatorReturn<ConfirmedRecallTypeRequest> => {
  let errors
  let valuesToSave

  const invalidFileName = isInvalidEmailFileName(fileName)
  const {
    recommendedRecallType,
    confirmedRecallType,
    confirmedRecallTypeDetailFixed,
    confirmedRecallTypeDetailStandard,
  } = requestBody
  const isAgreeValueValid = ['FIXED', 'STANDARD'].includes(confirmedRecallType)
  const userDisagreedWithRecommendation = confirmedRecallType && recommendedRecallType !== confirmedRecallType
  const isFixed = confirmedRecallType === 'FIXED'
  const isStandard = confirmedRecallType === 'STANDARD'
  const fixedDetailMissing = isFixed && !confirmedRecallTypeDetailFixed
  const standardDetailMissing = isStandard && !confirmedRecallTypeDetailStandard
  const existingUpload = requestBody[UploadDocumentRequest.category.CHANGE_RECALL_TYPE_EMAIL] === 'existingUpload'
  const uploadFailedValidation =
    userDisagreedWithRecommendation && ((!wasUploadFileReceived && !existingUpload) || uploadFailed || invalidFileName)
  if (uploadFailedValidation || !isAgreeValueValid || fixedDetailMissing || standardDetailMissing) {
    errors = []
    if (!isAgreeValueValid) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallType',
          text: 'Do you agree with the recall recommendation?',
        })
      )
    }
    if (fixedDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeDetailFixed',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (standardDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeDetailStandard',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (userDisagreedWithRecommendation && !wasUploadFileReceived && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (!uploadFailed && invalidFileName) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
        })
      )
    }
  }
  const unsavedValues = {
    confirmedRecallType,
    confirmedRecallTypeDetailFixed,
    confirmedRecallTypeDetailStandard,
  }
  if (!errors) {
    const detail = isFixed ? confirmedRecallTypeDetailFixed : confirmedRecallTypeDetailStandard
    valuesToSave = {
      confirmedRecallType: confirmedRecallType as ConfirmedRecallTypeRequest.confirmedRecallType,
      confirmedRecallTypeDetail: detail,
    }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'assess-licence' }
}
